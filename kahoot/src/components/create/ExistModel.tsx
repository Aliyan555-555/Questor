"use client"

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import {useRouter} from "next/navigation"


const ExitModel = ({ open, handleClose }: { open: boolean, handleClose: () => void }) => {
    const navigation = useRouter()
    const handleExit = () => {
        navigation.push("/")
    }
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle className="!font-bold">Confirm Exist</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to exit? Any unsaved changes will be lost.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} className="!bg-[#002F49] !px-4 !text-white" >
                    Cancel
                </Button>
                <Button
                    onClick={handleExit}
                    className="!bg-red_1"
                    variant="contained"
                >
                    Exit
                </Button>
            </DialogActions>
        </Dialog>
    )
}


export default ExitModel;