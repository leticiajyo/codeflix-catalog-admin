# codeflix-catalog-admin

## Project architecture

TBD

## Running the project locally

### Dev Container

TBD

### Keycloak

If you need to access the local Keycloak, it must be run outside of the dev container with the following command:

```
docker compose -f docker-compose.keycloak.yaml up
```

Then the UI will be accessible through `http://localhost:8080` with username `admin` and passord `admin`.
