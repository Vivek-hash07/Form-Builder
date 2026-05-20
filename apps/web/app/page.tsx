import { api } from "~/trpc/server";
import { useRouter } from 'next/navigation';
import { useUser } from "~/hooks/api/auth";
import { useEffect } from "react";

export default async function Home() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if(user && user.id) {
      router.replace('/dashboard')
    }else{
      router.replace('/login')
    }
  },[user, router])
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>{JSON.stringify(user)}</div>
    </main>
  );
}
