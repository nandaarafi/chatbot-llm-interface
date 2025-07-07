/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";


const ButtonSignin = ({
  text = "Login",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
//   const supabase = createClient();
//   const [user, setUser] = useState<User | null>(null);
//   useEffect(() => {
//     const getUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       setUser(user);
//     };

//     getUser();
//   }, [supabase]);

//   if (user) {
//     return (
//       <Link
//         href={config.auth.callbackUrl}
//         className={`btn rounded-full px-6 py-2 ${extraStyle ? extraStyle : ""}`}
//       >
//         {user?.user_metadata?.avatar_url ? (
//           <img
//             src={user?.user_metadata?.avatar_url}
//             alt={user?.user_metadata?.name || "Account"}
//             className="w-6 h-6 rounded-full shrink-0"
//             referrerPolicy="no-referrer"
//             width={24}
//             height={24}
//           />
//         ) : (
//           <span className="w-6 h-6 bg-background flex justify-center items-center rounded-full shrink-0 border border-border">
//           {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)}
//           </span>
//         )}
//         {user?.user_metadata?.name || user?.email || "Account"}
//       </Link>
//     );
//   }

  return (
    <Link
      className={`btn rounded-full px-6 py-2 ${extraStyle ? extraStyle : ""}`}
      href={"/sign-in"}
    >
      {text}
    </Link>
  );
};

export default ButtonSignin;
