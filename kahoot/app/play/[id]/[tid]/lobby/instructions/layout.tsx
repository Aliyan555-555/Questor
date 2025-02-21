"use client"
import { useSocket } from "@/src/hooks/useSocket";
import { RootState } from "@/src/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function RootLayout({ children }) {
    const student = useSelector((root: RootState) => root.student.currentGame?.student);
    const socket = useSocket();
    const navigation = useRouter();
    

    useEffect(() => {

        socket?.on("reconnecting", (data) => {
            console.log(data)
        });
    }, [])
    console.log(student
    )

    if (!student){
        navigation.push('/play/connect/to/game');
        return
    }
    return (
        <div className="w-screen h-screen bg-cover bg-top " style={{ backgroundImage: `url(${student?.quiz.theme.image})` }}>
            {children}
        </div>
    )
}

