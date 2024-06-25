# Use the official .NET 8 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the .csproj file and restore dependencies
COPY ["customer-service/customer-service/customer-service.csproj", "customer-service/"]
RUN dotnet restore "customer-service/customer-service.csproj"

# Copy the rest of the application files
COPY . .

WORKDIR /src/customer-service
RUN dotnet publish -c Release -o /app/publish

# Use the official ASP.NET Core runtime image to run the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port the application runs on
EXPOSE 8080
EXPOSE 8081


# Set the entry point for the container
ENTRYPOINT ["dotnet", "customer-service.dll"]
