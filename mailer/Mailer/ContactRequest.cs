using System.Text.RegularExpressions;

namespace Mailer;

/// <summary>Message envoyé par le formulaire du portfolio.</summary>
/// <param name="Website">Champ piège, invisible pour un humain : s'il est rempli, c'est un robot.</param>
public sealed record ContactRequest(string? Name, string? Email, string? Message, string? Website = null)
{
	public const int NameMaxLength = 100;
	public const int EmailMaxLength = 254;
	public const int MessageMaxLength = 5000;

	private static readonly Regex EmailPattern = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled);
	private static readonly Regex ControlChars = new(@"[\p{Cc}]", RegexOptions.Compiled);

	public bool IsBot => !string.IsNullOrWhiteSpace(Website);

	/// <summary>Nettoie les champs : espaces superflus, et aucun caractère de contrôle dans le nom ou l'email.</summary>
	public ContactRequest Normalize() => this with
	{
		Name = ControlChars.Replace(Name ?? "", " ").Trim(),
		Email = ControlChars.Replace(Email ?? "", "").Trim(),
		Message = (Message ?? "").Trim()
	};

	/// <summary>Valide une requête déjà normalisée. Renvoie les erreurs par champ, au format ValidationProblem.</summary>
	public Dictionary<string, string[]> Validate()
	{
		var errors = new Dictionary<string, string[]>();

		if (string.IsNullOrEmpty(Name))
			errors["name"] = ["Le nom est requis."];
		else if (Name.Length > NameMaxLength)
			errors["name"] = [$"Le nom dépasse {NameMaxLength} caractères."];

		if (string.IsNullOrEmpty(Email) || Email.Length > EmailMaxLength || !EmailPattern.IsMatch(Email))
			errors["email"] = ["L'adresse email est invalide."];

		if (string.IsNullOrEmpty(Message))
			errors["message"] = ["Le message est requis."];
		else if (Message.Length > MessageMaxLength)
			errors["message"] = [$"Le message dépasse {MessageMaxLength} caractères."];

		return errors;
	}
}
