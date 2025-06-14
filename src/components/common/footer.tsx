import { Logo } from "@/components/common/logo";
import { Panel, PanelContent, Pattern } from "@/components/ui/panel";
import { APP_NAME } from "@/lib/constants";
import {
  Activity,
  BarChart3,
  FileText,
  HelpCircle,
  Home,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="max-w-4xl mx-auto px-4">
        <Pattern />
        <Panel>
          <PanelContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <Link href="/" className="flex items-center">
                  <Logo priority />
                </Link>
                <p className="text-sm text-muted-foreground max-w-md">
                  Fast, secure, and simple pastebin service for sharing code and
                  text snippets. Share your code with the world or keep it
                  private.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/privacy"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-8 mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  © {currentYear} {APP_NAME}. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <Link
                    href="/api-docs"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    API
                  </Link>
                  <Link
                    href="https://dup.openstatus.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Status
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Help
                  </Link>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </div>
    </footer>
  );
}
