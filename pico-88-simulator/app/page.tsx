import { Pico88Simulator } from "@/components/simulator/pico-88-simulator";
import { Pico88Specification } from "@/components/pico-88-specification";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bug, User } from "lucide-react";
import { LuGithub } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Pico88Icon } from "@/components/ui/pico88-icon";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="simulator" className="w-full">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* デスクトップヘッダー */}
          <div className="px-4 py-3">
            {/* メイン行 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pico88Icon
                  className="h-5 w-5 text-foreground/70"
                  enableDownload={true}
                />
                <h1 className="text-xl font-mono font-semibold text-foreground/80 tracking-wider">
                  Pico88
                </h1>
              </div>

              {/* デスクトップ用タブ（中央） */}
              <div className="hidden md:block">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="simulator" className="text-sm px-6">
                    シミュレータ
                  </TabsTrigger>
                  <TabsTrigger value="specification" className="text-sm px-6">
                    仕様書
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* デスクトップ用アイコン */}
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <a
                    href="https://github.com/GenichiMaruo/pico-88"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHubリポジトリ"
                  >
                    <LuGithub className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <a
                    href="https://github.com/GenichiMaruo/pico-88/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="不具合報告"
                  >
                    <Bug className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <a
                    href="https://maru1010.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="作者のページ"
                  >
                    <User className="h-4 w-4" />
                  </a>
                </Button>
                <ThemeToggle />
              </div>

              {/* モバイル用ハンバーガーメニュー */}
              <div className="relative md:hidden">
                <MobileMenu />
              </div>
            </div>

            {/* モバイル用タブ（下の行） */}
            <div className="mt-3 md:hidden">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="simulator" className="text-sm">
                  シミュレータ
                </TabsTrigger>
                <TabsTrigger value="specification" className="text-sm">
                  仕様書
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <TabsContent value="simulator">
            <Pico88Simulator />
          </TabsContent>

          <TabsContent value="specification">
            <Pico88Specification />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
