"use client";
import React, { FC, MouseEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { signOut } from "next-auth/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Button, Tooltip } from "@mui/material";
import Link from "next/link";
import { Loader2, Lock, LogOut } from "lucide-react";
import { SessionType } from "@/lib/types";

interface Props {
  session: SessionType;
}

const UserButton: FC<Props> = ({ session }) => {
  const { user } = session;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const signUserOut = async () => {
    setIsLoading(true);

    try {
      await signOut();
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (localStorage.getItem("theme") === "system") {
      setPrefersDarkMode(true);
    } else {
      setPrefersDarkMode(
        localStorage.getItem("theme") === "dark" ? true : false
      );
    }
  }, [open]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <motion.div
      className="fixed right-6 top-6 z-10 hidden h-[3.25rem] w-[3.25rem] cursor-pointer items-center justify-center rounded-full border-[0.07rem] border-black border-opacity-40 bg-white bg-opacity-80 shadow-md transition-all duration-200 ease-in dark:border-black/40 dark:bg-gray-950 md:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
      whileHover={{
        scale: 1.15,
      }}
      whileTap={{
        scale: 1.05,
      }}
    >
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            textAlign: "center",
            borderRadius: "100%",
          }}
        >
          <Button
            onClick={handleClick}
            size="small"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            sx={{
              borderRadius: "100%",
              ":hover": { backgroundColor: "transparent" },
            }}
          >
            <Tooltip title="Account" placement="left">
              <Image
                src={user.image}
                alt=""
                width={100}
                height={100}
                priority={true}
                className="h-13 w-13 rounded-full border-[0.2rem] border-white object-cover"
              />
            </Tooltip>
          </Button>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          sx={{ margin: 0, padding: 0 }}
        >
          <div className="m-0 w-40 p-0 dark:bg-opacity-75">
            <Link href="/admin" className="flexflex-row items-center">
              <MenuItem className="h-10  w-full ">
                <Lock className="mr-3 h-5 w-5" />
                Admin
              </MenuItem>
            </Link>
            <MenuItem
              onClick={signUserOut}
              disabled={isLoading}
              className="h-10"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="mr-3 h-5 w-5" />
              )}
              Logout
            </MenuItem>
          </div>
        </Menu>
      </ThemeProvider>
    </motion.div>
  );
};

export default UserButton;
