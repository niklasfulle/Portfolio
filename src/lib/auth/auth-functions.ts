import { shortToast } from "@/lib/helpers/shorter-function";
import { signIn } from "next-auth/react";
import { Dispatch, FormEvent, SetStateAction } from "react";

// TODO Check for unhandels errors

type SetIsLoading = Dispatch<SetStateAction<boolean>>;

type SetError = Dispatch<SetStateAction<string>>;



// handles the login with credentials
export const loginWithCredentials = async (e: FormEvent, setIsLoading: SetIsLoading, setError: SetError) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };

    const email = target.email.value;
    const password = target.password.value;

    const res = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });

    if (res?.error) {
      if (typeof res.error === "string" && res.error.charAt(0) === "[") {
        const error: any = JSON.parse(res.error);

        shortToast("Error", error[0].message, "error", 5000);
        setError(error[0].message);
      } else {
        shortToast("Error", res.error, "error", 5000);
        setError(res.error);
      }
    } else {
      //window.location.href = "/";
    }
  } catch (error) {
    shortToast("Error", "There was an error logging in.", "error", 5000);
  }
  setIsLoading(false);
};