# syntax=docker/dockerfile:1.7

FROM mcr.microsoft.com/dotnet/sdk:9.0-bookworm-slim AS build
WORKDIR /src

COPY educodeai-server.csproj ./
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore educodeai-server.csproj

COPY . .
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish educodeai-server.csproj \
      --configuration Release \
      --output /app/publish \
      --no-restore \
      /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install --no-install-recommends --yes \
        ca-certificates \
        curl \
        ffmpeg \
        fontconfig \
        libfontconfig1 \
        libfreetype6 \
        libgdiplus \
        libleptonica-dev \
        libtesseract5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app \
    && mkdir -p /app/ffmpeg /app/wwwroot/uploads /app/tessdata \
    && ln -s /usr/bin/ffmpeg /app/ffmpeg/ffmpeg \
    && ln -s /usr/bin/ffprobe /app/ffmpeg/ffprobe \
    && chown -R app:app /app

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_EnableDiagnostics=0 \
    COMPlus_EnableDiagnostics=0

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl --fail --silent http://127.0.0.1:8080/health >/dev/null || exit 1

USER 10001:10001
ENTRYPOINT ["dotnet", "educodeai-server.dll"]
