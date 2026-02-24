import Echo from "laravel-echo"
import Pusher from "pusher-js"

let echoInstance: Echo<any> | null = null
let currentToken: string | null = null

const getEnv = (key: string): string => {
    const envVars: Record<string, string | undefined> = {
        NEXT_PUBLIC_REVERB_APP_KEY: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        NEXT_PUBLIC_REVERB_HOST: process.env.NEXT_PUBLIC_REVERB_HOST,
        NEXT_PUBLIC_REVERB_PORT: process.env.NEXT_PUBLIC_REVERB_PORT,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    };

    const value = envVars[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is missing!`)
    }
    return value;
};

export function getEcho(token: string) {
    if (typeof window === "undefined") return null
    window.Pusher = Pusher

    if (echoInstance && currentToken !== token) {
        echoInstance.disconnect();
        echoInstance = null;
    }

    if (echoInstance) return echoInstance;

    currentToken = token;
    echoInstance = new Echo({
        broadcaster: "reverb",
        key: getEnv('NEXT_PUBLIC_REVERB_APP_KEY'),
        wsHost: getEnv('NEXT_PUBLIC_REVERB_HOST'),
        wsPort: Number(getEnv('NEXT_PUBLIC_REVERB_PORT')),
        forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    })

    echoInstance.connector.pusher.connection.bind("connected", () => {
        console.log("WebSocket connected");
    })

    echoInstance.connector.pusher.connection.bind("error", (err: any) => {
        console.error("WebSocket error:", err);
    })

    return echoInstance;
}