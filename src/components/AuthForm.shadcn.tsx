import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { CheckCircle } from "phosphor-react";
import { useState } from "react";

type Props = {
  onAuth: (
    username: string,
    password: string,
    mode: "login" | "signup",
  ) => Promise<void>;
  status: string;
};

export default function AuthForm({ onAuth, status }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [cred, setCred] = useState({ username: "", password: "" });

  async function handleSubmit() {
    await onAuth(cred.username, cred.password, mode);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl shadow-primary/5 border-border/50">
          <CardHeader className="space-y-4 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gradient">
                My Tanks
              </p>
              <CardTitle className="mt-2 text-3xl font-bold">
                Freshwater Management
              </CardTitle>
              <CardDescription className="mt-2">
                Track tanks, fish, water changes, and feeding schedules
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "login" | "signup")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={cred.username}
                    onChange={(e) =>
                      setCred({ ...cred, username: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={cred.password}
                    onChange={(e) =>
                      setCred({ ...cred, password: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="w-full"
                >
                  {status === "loading" ? "Logging in..." : "Log in"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    placeholder="Choose a username"
                    value={cred.username}
                    onChange={(e) =>
                      setCred({ ...cred, username: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a password"
                    value={cred.password}
                    onChange={(e) =>
                      setCred({ ...cred, password: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                {/* Feature List */}
                <div className="space-y-2 rounded-md bg-muted/50 p-4">
                  <p className="text-sm font-semibold">What you get:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Track multiple tanks and fish species</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Automatic bioload calculation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Water change and feeding reminders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>Cloud sync across devices</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="w-full"
                >
                  {status === "loading"
                    ? "Creating account..."
                    : "Create account"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No email required. Your data syncs to the cloud automatically.
                </p>
              </TabsContent>
            </Tabs>

            {status === "error" && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Authentication failed. Please try again.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
