import Echo from "laravel-echo"
import Pusher from "pusher-js"

let echo: Echo<any> | null = null

export function getEcho(token: string) {
    if (echo) return echo
    if (typeof window === "undefined") return null
    window.Pusher = Pusher

    echo = new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT!),
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

    echo.connector.pusher.connection.bind("connected", () => {
        console.log("WebSocket connected")
    })

    echo.connector.pusher.connection.bind("error", (err: Error) => {
        console.error("WebSocket error:", err)
    })

    return echo
}
