# mora-master

Mora User Center, now it is a frontend demo.

When user login into mora, it will enter this. It has the following features:

- manage my planets.
- manage my subscribed planets
- set my userinfo
- enter planet's backstage, and manage artiles, comments, subcribe prices.

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd mora-master/
dfx help
dfx config --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://{asset_canister_id}.localhost:8000/`.

Additionally, if you are making frontend changes, you can start a development server with

```bash
npm run dev
```

Which will start a server at `http://localhost:3000`.
