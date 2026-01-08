import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center gap-2 bg-zinc-50 font-sans dark:bg-black">
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>

            <Button variant="outline" asChild>
                <Link href="/register">Register</Link>
            </Button>
        </div>
    );
}
