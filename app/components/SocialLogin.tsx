// app/routes/login.tsx
import { useFetcher } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import React from "react";
import Button from "./Buttons/IconButton";

interface SocialButtonProps {
  provider: SocialsProvider;
  label: string;
  icon: JSX.Element;
}

function SocialButton({
  provider,
  label,
  icon,
}: React.PropsWithChildren<SocialButtonProps>) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form action={`/auth/${provider}`} method="post" reloadDocument>
      <Button
        className="w-full"
        aria-label={label}
        type="submit"
        variant="secondary"
        rightIcon={icon}
      >
        {label}
      </Button>
    </fetcher.Form>
  );
}

export default function SocialLogin() {
  return (
    <div className="pt-3">
      <SocialButton
        provider={SocialsProvider.GOOGLE}
        label="Login with Google"
        icon={
          <FontAwesomeIcon style={{ marginLeft: ".5rem" }} icon={faGoogle} />
        }
      />
    </div>
  );
}
