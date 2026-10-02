using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Mailer.Tests;

public sealed class ContactEndpointTests : IDisposable
{
	private readonly FakeMailer _mailer = new();
	private readonly WebApplicationFactory<Program> _factory;

	public ContactEndpointTests()
	{
		_factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
		{
			b.UseSetting("Smtp:Host", "localhost");
			b.UseSetting("Smtp:From", "noreply@cardinalexandre.fr");
			b.ConfigureServices(s => s.Replace(ServiceDescriptor.Singleton<IContactMailer>(_mailer)));
		});
	}

	public void Dispose() => _factory.Dispose();

	private static object Valid(string? website = null) =>
		new { name = "Ada Lovelace", email = "ada@example.com", message = "Un projet un peu fou ?", website };

	[Fact]
	public async Task Valid_message_is_sent()
	{
		var response = await _factory.CreateClient().PostAsJsonAsync("/api/contact", Valid());

		Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
		var sent = Assert.Single(_mailer.Sent);
		Assert.Equal("ada@example.com", sent.Email);
	}

	[Theory]
	[InlineData("", "ada@example.com", "Bonjour", "name")]
	[InlineData("Ada", "pas-un-email", "Bonjour", "email")]
	[InlineData("Ada", "ada@example.com", "   ", "message")]
	public async Task Invalid_message_is_rejected(string name, string email, string message, string field)
	{
		var response = await _factory.CreateClient().PostAsJsonAsync("/api/contact", new { name, email, message });

		Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
		Assert.Contains($"\"{field}\"", await response.Content.ReadAsStringAsync());
		Assert.Empty(_mailer.Sent);
	}

	[Fact]
	public async Task Honeypot_pretends_success_without_sending()
	{
		var response = await _factory.CreateClient().PostAsJsonAsync("/api/contact", Valid(website: "http://spam.example"));

		Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
		Assert.Empty(_mailer.Sent);
	}

	[Fact]
	public async Task Smtp_failure_returns_bad_gateway()
	{
		_mailer.Fail = true;

		var response = await _factory.CreateClient().PostAsJsonAsync("/api/contact", Valid());

		Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
	}

	[Fact]
	public async Task Sixth_message_from_same_visitor_is_throttled()
	{
		var client = _factory.CreateClient();
		client.DefaultRequestHeaders.Add("X-Forwarded-For", "203.0.113.7");

		for (var i = 0; i < 5; i++)
			Assert.Equal(HttpStatusCode.Accepted, (await client.PostAsJsonAsync("/api/contact", Valid())).StatusCode);

		var throttled = await client.PostAsJsonAsync("/api/contact", Valid());
		Assert.Equal(HttpStatusCode.TooManyRequests, throttled.StatusCode);

		// Un autre visiteur n'est pas pénalisé
		var other = _factory.CreateClient();
		other.DefaultRequestHeaders.Add("X-Forwarded-For", "198.51.100.2");
		Assert.Equal(HttpStatusCode.Accepted, (await other.PostAsJsonAsync("/api/contact", Valid())).StatusCode);
	}

	[Fact]
	public void Visitor_goes_in_reply_to_and_domain_mailbox_stays_sender()
	{
		var options = new SmtpOptions { From = "noreply@cardinalexandre.fr" };
		var request = new ContactRequest("Ada\r\nBcc: evil@example.com", "ada@example.com", "Salut").Normalize();

		using var message = SmtpContactMailer.BuildMessage(request, options, DateTimeOffset.UnixEpoch);

		Assert.Equal("noreply@cardinalexandre.fr", Assert.Single(message.From.Mailboxes).Address);
		Assert.Equal("dev@cardinalexandre.fr", Assert.Single(message.To.Mailboxes).Address);
		Assert.Equal("ada@example.com", Assert.Single(message.ReplyTo.Mailboxes).Address);
		Assert.Empty(message.Bcc);
		Assert.DoesNotContain("\n", message.Subject ?? "");
	}

	private sealed class FakeMailer : IContactMailer
	{
		public List<ContactRequest> Sent { get; } = [];
		public bool Fail { get; set; }

		public Task SendAsync(ContactRequest request, CancellationToken cancellationToken)
		{
			if (Fail) throw new InvalidOperationException("SMTP indisponible");
			Sent.Add(request);
			return Task.CompletedTask;
		}
	}
}
