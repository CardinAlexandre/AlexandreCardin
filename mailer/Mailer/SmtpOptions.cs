using System.ComponentModel.DataAnnotations;
using MailKit.Security;

namespace Mailer;

/// <summary>Configuration SMTP, lue depuis la section "Smtp" (ou les variables Smtp__*).</summary>
public sealed class SmtpOptions
{
	[Required]
	public string Host { get; set; } = "ssl0.ovh.net";

	[Range(1, 65535)]
	public int Port { get; set; } = 465;

	/// <summary>Auto : SSL direct sur 465, STARTTLS sur 587. "None" pour un serveur de test local.</summary>
	public SecureSocketOptions Security { get; set; } = SecureSocketOptions.Auto;

	public string? Username { get; set; }

	public string? Password { get; set; }

	/// <summary>Expéditeur : doit être une boîte du domaine, sinon le SPF fait échouer la livraison.</summary>
	[Required, EmailAddress]
	public string From { get; set; } = "";

	/// <summary>Destinataire des messages du formulaire.</summary>
	[Required, EmailAddress]
	public string To { get; set; } = "dev@cardinalexandre.fr";
}
