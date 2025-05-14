
import { Dialog, DialogContent } from "../ui/dialog";
import { toast } from "sonner";
import { useEffect } from "react";

const OtpModal = ({ otpModal, setOtpModal }:any) => {

    useEffect(() => {
        if (otpModal.open && otpModal.otp) {
            try {
                navigator.clipboard.writeText(otpModal.otp);
                toast.success("OTP copied to clipboard");
            } catch (err) {
                console.error("Auto-copy failed", err);
                toast.error("Failed to copy OTP");
            }
        }
    }, [otpModal.open, otpModal.otp]);
  return (
    <div>
          <Dialog open={otpModal.open} onOpenChange={(open) => setOtpModal({ open, otp: null })}>
              <DialogContent className="p-6 text-center space-y-4">
                  <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full  bg-green-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-green-600 animate-ping-once" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                      </div>
                  </div>
                  <h2 className="text-xl font-semibold">OTP Generated Successfully</h2>
                  <div className="text-2xl font-bold tracking-wider bg-muted p-2 rounded w-full">
                      {otpModal.otp}
                  </div>
                  <p className="text-muted-foreground text-sm">
                      This OTP is valid for a short time. Please share it securely.
                  </p>
                  {/* <Button
                      variant="outline"
                      className="w-full cursor-pointer flex items-center justify-center gap-2"
                      onClick={() => {
                          navigator.clipboard.writeText(otpModal.otp || "");
                          toast.success("OTP copied to clipboard");
                      }}
                  >
                      <Clipboard className="w-4 h-4" /> Copy OTP
                  </Button> */}
              </DialogContent>
          </Dialog>
    </div>
  )
}

export default OtpModal