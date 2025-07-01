"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bug, User, Menu, X } from "lucide-react";
import { LuGithub } from "react-icons/lu";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-background border rounded-lg shadow-lg p-2 z-50">
          <div className="flex flex-col space-y-1">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/GenichiMaruo/pico-88"
                target="_blank"
                rel="noopener noreferrer"
                className="justify-start"
                onClick={() => setIsOpen(false)}
              >
                <LuGithub className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/GenichiMaruo/pico-88/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="justify-start"
                onClick={() => setIsOpen(false)}
              >
                <Bug className="h-4 w-4 mr-2" />
                不具合報告
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://maru1010.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="justify-start"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                作者のページ
              </a>
            </Button>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center space-x-2 px-3 py-1">
                <span className="text-sm text-muted-foreground">テーマ:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
