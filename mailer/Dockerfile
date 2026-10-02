# Service d'envoi du formulaire de contact (ASP.NET Core minimal API)
# Build sur la plateforme du runner, image finale multi-arch (arm64 pour le Raspberry Pi).
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Mailer/Mailer.csproj Mailer/
RUN dotnet restore Mailer/Mailer.csproj
COPY Mailer/ Mailer/
RUN dotnet publish Mailer/Mailer.csproj -c Release --no-restore -o /app -p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_HTTP_PORTS=8080
USER $APP_UID
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["dotnet", "Mailer.dll"]
