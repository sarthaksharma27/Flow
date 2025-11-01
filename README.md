
# Flow - cursor for 2D animation

Built something cool that turns prompts into 2D animated videos using the Manim animation engine!

Perfect for teaching, Explaining dev concepts or just geeking out. Just type a prompt → Get a slick animation

Here is the System desing doc - https://www.notion.so/Flow-System-design-doc-220c591ae88a80da87bbe95ade0222f1?source=copy_link   

It explains exactly what this application does, its architecture, the limitations of that architecture, and the design choices I made — along with the reasoning behind them.




[![Watch Demo](https://github.com/user-attachments/assets/e567e073-e5f4-4a08-9579-164a987d2812)](https://github.com/user-attachments/assets/58e85802-e9a4-469c-af38-aa804322073b)




## Run Locally

Clone the project

```bash
git clone https://github.com/sarthaksharma27/Flow.git
```

```bash
 cd Flow
 ```

```bash
 cd next-app
 ```

 Create a .env file and paste this configuration

 ```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
OPENROUTER_API_KEY=
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

```bash
 npm run dev
 ```

 Frontend is live on http://localhost:3000

 Now, to start the Backend

 ```bash
 cd ws-server
 ```

  Create a .env file and paste this configuration

 ```bash
PORT=4000
REDIS_URL=redis://redis:6379
```

 ```bash
 cd worker
 ```

 Create a .env file and paste this configuration

  ```bash
REDIS_URL=redis://redis:6379
AZURE_STORAGE_CONNECTION_STRING=
```

Build the Docker image

```bash
 docker compose build
 ```

Start the Backend

```bash
docker compose up
```

The will start Backend and redis server

