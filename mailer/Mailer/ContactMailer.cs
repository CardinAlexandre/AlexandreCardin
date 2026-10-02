using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Mailer;

public interface IContactMailer
{
	Task SendAsync(ContactRequest request, CancellationToken cancellationToken);
}

/// <summary>Envoie le message du formulaire par SMTP authentifié.</summary>
public sealed class SmtpContactMailer(IOptions<SmtpOptions> options, TimeProvider clock) : IContactMailer
{
	private readonly SmtpOptions _options = options.Value;

	public async Task SendAsync(ContactRequest request, CancellationToken cancellationToken)
	{
		using var message = BuildMessage(request, _options, clock.GetUtcNow());

		using var client = new SmtpClient { Timeout = 15_000 };
		await client.ConnectAsync(_options.Host, _options.Port, _options.Security, cancellationToken);
		if (!string.IsNullOrEmpty(_options.Username))
			await client.AuthenticateAsync(_options.Username, _options.Password ?? "", cancellationToken);
		await client.SendAsync(message, cancellationToken);
		await client.DisconnectAsync(true, cancellationToken);
	}

	/// <summary>
	/// L'expéditeur reste la boîte du domaine (SPF/DKIM), le visiteur est mis en Reply-To :
	/// un simple « Répondre » lui écrit directement.
	/// </summary>
	public static MimeMessage BuildMessage(ContactRequest request, SmtpOptions options, DateTimeOffset sentAt)
	{
		var message = new MimeMessage();
		message.From.Add(new MailboxAddress($"{request.Name} (portfolio)", options.From));
		message.To.Add(MailboxAddress.Parse(options.To));
		message.ReplyTo.Add(new MailboxAddress(request.Name, request.Email!)); // requête déjà validée
		message.Subject = $"[Portfolio] Nouveau message de {request.Name}";
		message.Body = new TextPart("plain")
		{
			Text = $"""
				Nom     : {request.Name}
				Email   : {request.Email}
				Reçu le : {sentAt:dd/MM/yyyy HH:mm} UTC

				{request.Message}

				--
				Envoyé depuis le formulaire de cardinalexandre.fr
				"""
		};
		return message;
	}
}
