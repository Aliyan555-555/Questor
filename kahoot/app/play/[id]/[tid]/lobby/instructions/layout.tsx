"use client"
import { RootState } from "@/src/redux/store";
import { useSelector } from "react-redux";

export default function RootLayout({ children }) {
    const student = useSelector((root: RootState) => root.student.currentGame?.student);
    return (
        <div className="w-screen h-screen bg-cover bg-top " style={{ backgroundImage: `url(${student.kahoot.theme.image})` }}>
            {children}
        </div>
    )
}

