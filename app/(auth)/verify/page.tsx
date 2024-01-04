import Background from "../../../components/ui/wrapper";
import Link from "next/link";

export default function Verify() {
  return (
    <Background position="absolute">
      <div className="w-[400px] h-[300px] bg-zinc-600 rounded-[20px] flex flex-col justify-center items-center">
        <div className="text-[2rem] font-bold my-2 text-gray-200">
          Check your email
        </div>
        <div className="text-[14px] font-semibold my-2 text-gray-200">
          A sign in link has been sent to your email address.
        </div>
        <Link
          href={"/dashboard"}
          className="text-[14px] font-semibold my-4 text-gray-300 hover:underline"
        >
          {process.env.NEXTAUTH_URL}/dashboard
        </Link>
      </div>
    </Background>
  );
}
