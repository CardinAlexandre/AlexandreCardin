using System.Threading.RateLimiting;
using Mailer;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<SmtpOptions>()
	.Bind(builder.Configuration.GetSection("Smtp"))
	.ValidateDataAnnotations()
	.ValidateOnStart();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IContactMailer, SmtpContactMailer>();
builder.Services.AddProblemDetails();

// Le service n'est joignable que depuis le réseau Docker, derrière nginx :
// on fait confiance à l'en-tête X-Forwarded-For pour retrouver l'IP du visiteur.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
	o.ForwardedHeaders = ForwardedHeaders.XForwardedFor;
	o.KnownIPNetworks.Clear();
	o.KnownProxies.Clear();
});

builder.Services.AddRateLimiter(o =>
{
	o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

	// Par visiteur : 5 messages par tranche de 10 minutes.
	o.AddPolicy("contact", ctx => RateLimitPartition.GetFixedWindowLimiter(
		ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
		_ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(10) }));

	// Garde-fou global pour protéger la boîte SMTP d'un spam distribué.
	o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(_ => RateLimitPartition.GetFixedWindowLimiter(
		"global",
		_ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromHours(1) }));
});

builder.WebHost.ConfigureKestrel(k => k.Limits.MaxRequestBodySize = 32 * 1024);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseRateLimiter();

app.MapPost("/api/contact", async (ContactRequest body, IContactMailer mailer, ILogger<Program> logger, CancellationToken ct) =>
{
	// Un robot a rempli le champ piège : on fait semblant que tout va bien.
	if (body.IsBot)
	{
		logger.LogInformation("Message ignoré (champ piège rempli)");
		return Results.Accepted();
	}

	var request = body.Normalize();
	var errors = request.Validate();
	if (errors.Count > 0)
		return Results.ValidationProblem(errors);

	try
	{
		await mailer.SendAsync(request, ct);
		logger.LogInformation("Message de contact transmis");
		return Results.Accepted();
	}
	catch (Exception ex) when (ex is not OperationCanceledException)
	{
		logger.LogError(ex, "Échec de l'envoi du message de contact");
		return Results.Problem(statusCode: StatusCodes.Status502BadGateway, title: "L'envoi du mail a échoué.");
	}
})
.RequireRateLimiting("contact");

app.MapGet("/health", () => Results.Text("healthy"))
	.DisableRateLimiting();

app.Run();

public partial class Program;
