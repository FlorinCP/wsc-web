// components/Navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <MobileNav setIsOpen={setIsOpen} pathname={pathname} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="hidden md:block">
            <span className="font-bold ml-4 text-xl">Just Sudoku</span>
          </Link>
        </div>

        <div className="hidden md:flex">
          <DesktopNav pathname={pathname} />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/" && "bg-accent text-accent-foreground",
              )}
            >
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              pathname &&
                ["/solver", "/generator", "/learn"].some((route) =>
                  pathname.startsWith(route),
                ) &&
                "bg-accent text-accent-foreground",
            )}
          >
            Features
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Sudoku Solver
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Solve any Sudoku puzzle with our powerful
                      WebAssembly-based engine
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem
                href="/solver"
                title="Solver"
                active={pathname === "/solver"}
              >
                Solve individual puzzles or process batches
              </ListItem>
              <ListItem
                href="/generator"
                title="Generator"
                active={pathname === "/generator"}
              >
                Generate new Sudoku puzzles of varying difficulty
              </ListItem>
              <ListItem
                href="/learn"
                title="Learn"
                active={pathname === "/learn"}
              >
                Learn Sudoku strategies and techniques
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/play" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/about" && "bg-accent text-accent-foreground",
              )}
            >
              Play
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/batch-solve" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/about" && "bg-accent text-accent-foreground",
              )}
            >
              Batch Solve
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/about" && "bg-accent text-accent-foreground",
              )}
            >
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNav({
  setIsOpen,
  pathname,
}: {
  setIsOpen: (open: boolean) => void;
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-4 px-2 py-4">
      <Link
        href="/"
        className="flex h-8 items-center gap-2 px-2 font-bold"
        onClick={() => setIsOpen(false)}
      >
        Sudoku Solver
      </Link>
      <div className="flex flex-col space-y-2">
        <MobileLink href="/" setIsOpen={setIsOpen} active={pathname === "/"}>
          Home
        </MobileLink>
        <div className="px-2 text-sm font-medium text-muted-foreground">
          Features
        </div>
        <MobileLink
          href="/solver"
          setIsOpen={setIsOpen}
          className="pl-4"
          active={pathname === "/solver"}
        >
          Solver
        </MobileLink>
        <MobileLink
          href="/generator"
          setIsOpen={setIsOpen}
          className="pl-4"
          active={pathname === "/generator"}
        >
          Generator
        </MobileLink>
        <MobileLink
          href="/learn"
          setIsOpen={setIsOpen}
          className="pl-4"
          active={pathname === "/learn"}
        >
          Learn
        </MobileLink>
        <MobileLink
          href="/about"
          setIsOpen={setIsOpen}
          active={pathname === "/about"}
        >
          About
        </MobileLink>
      </div>
    </div>
  );
}

interface MobileLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
  active?: boolean;
}

function MobileLink({
  href,
  setIsOpen,
  children,
  className,
  active,
  ...props
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => setIsOpen(false)}
      className={cn(
        "flex h-8 items-center rounded-md px-2 text-sm font-medium",
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
  active?: boolean;
}

const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, active, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);

ListItem.displayName = "ListItem";
