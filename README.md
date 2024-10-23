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

### Elastic Stack

If you need to access the Elastic Stack, run the following command outside the dev container:

```
docker compose -f docker-compose.elk.yaml up
```

To connect the app logs, run the following command from inside the dev container:

```
npm run start:dev &> /proc/1/fd/1
```

Now Kibana UI will be accessible through `http://localhost:5601` and the app logs will be displayed.
