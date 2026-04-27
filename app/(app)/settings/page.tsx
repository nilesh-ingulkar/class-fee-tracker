"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { User, Bell, Globe, Shield, LogOut, Coins, Plus, Trash2, Palette, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  enabled: boolean;
}

const themes = [
  { value: "light", label: "Light", icon: Sun, description: "Clean and bright" },
  { value: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
  { value: "blue", label: "Professional", icon: Monitor, description: "Blue SaaS theme" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: "USD", name: "US Dollar", symbol: "$", enabled: true },
    { code: "INR", name: "Indian Rupee", symbol: "₹", enabled: true },
  ]);
  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState(false);
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCurrencyCode && newCurrencyName && newCurrencySymbol) {
      setCurrencies([
        ...currencies,
        {
          code: newCurrencyCode.toUpperCase(),
          name: newCurrencyName,
          symbol: newCurrencySymbol,
          enabled: true,
        },
      ]);
      setNewCurrencyCode("");
      setNewCurrencyName("");
      setNewCurrencySymbol("");
      setIsAddCurrencyOpen(false);
    }
  };

  const handleToggleCurrency = (code: string) => {
    setCurrencies(
      currencies.map((c) =>
        c.code === code ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const handleRemoveCurrency = (code: string) => {
    if (currencies.length <= 1 || code === defaultCurrency) return;
    setCurrencies(currencies.filter((c) => c.code !== code));
  };

  const enabledCurrencies = currencies.filter((c) => c.enabled);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Palette className="h-4 w-4 shrink-0" />
            Appearance
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Choose your preferred theme
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all sm:gap-2 sm:p-4",
                  theme === t.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <t.icon className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6",
                  theme === t.value ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-medium sm:text-sm",
                  theme === t.value ? "text-primary" : "text-foreground"
                )}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <User className="h-4 w-4 shrink-0" />
            Profile
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4 sm:px-6 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0 sm:h-14 sm:w-14 sm:text-xl">
              JD
            </div>
            <Button variant="outline" size="sm">
              Change photo
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs sm:text-sm">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Management */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
                <Coins className="h-4 w-4 shrink-0" />
                Currencies
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage supported currencies
              </CardDescription>
            </div>
            <Dialog open={isAddCurrencyOpen} onOpenChange={setIsAddCurrencyOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add a new currency</DialogTitle>
                  <DialogDescription>
                    Add a new currency to use for tracking class fees.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCurrency}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currencyCode">Currency Code</Label>
                      <Input
                        id="currencyCode"
                        placeholder="e.g. EUR"
                        value={newCurrencyCode}
                        onChange={(e) => setNewCurrencyCode(e.target.value)}
                        maxLength={3}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        3-letter ISO code (e.g., EUR, GBP, JPY)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencyName">Currency Name</Label>
                      <Input
                        id="currencyName"
                        placeholder="e.g. Euro"
                        value={newCurrencyName}
                        onChange={(e) => setNewCurrencyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Symbol</Label>
                      <Input
                        id="currencySymbol"
                        placeholder="e.g. €"
                        value={newCurrencySymbol}
                        onChange={(e) => setNewCurrencySymbol(e.target.value)}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddCurrencyOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Currency</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {/* Mobile: Card Layout */}
          <div className="space-y-2 sm:hidden">
            {currencies.map((currency) => (
              <div
                key={currency.code}
                className="p-3 rounded-lg border bg-card flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{currency.code}</span>
                    <Badge variant={currency.enabled ? "default" : "secondary"} className="text-xs">
                      {currency.enabled ? "Active" : "Off"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {currency.name} ({currency.symbol})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Switch
                    checked={currency.enabled}
                    onCheckedChange={() => handleToggleCurrency(currency.code)}
                    disabled={enabledCurrencies.length === 1 && currency.enabled}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveCurrency(currency.code)}
                    disabled={currencies.length === 1 || currency.code === defaultCurrency}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.code}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={currency.enabled ? "default" : "secondary"}>
                        {currency.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={currency.enabled}
                          onCheckedChange={() => handleToggleCurrency(currency.code)}
                          disabled={enabledCurrencies.length === 1 && currency.enabled}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveCurrency(currency.code)}
                          disabled={currencies.length === 1 || currency.code === defaultCurrency}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Active currencies can be selected when creating new classes.
          </p>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Globe className="h-4 w-4 shrink-0" />
            Preferences
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs sm:text-sm">Default currency</Label>
            <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabledCurrencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default currency for new classes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Bell className="h-4 w-4 shrink-0" />
            Notifications
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3 sm:px-6 sm:pb-6 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label className="text-xs sm:text-sm">Email notifications</Label>
              <p className="text-xs text-muted-foreground truncate">
                Receive email updates
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label className="text-xs sm:text-sm">Payment reminders</Label>
              <p className="text-xs text-muted-foreground truncate">
                Get reminded about balances
              </p>
            </div>
            <Switch
              checked={reminderNotifications}
              onCheckedChange={setReminderNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 sm:text-base">
            <Shield className="h-4 w-4 shrink-0" />
            Security
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage your password and security
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label className="text-xs sm:text-sm">Password</Label>
              <p className="text-xs text-muted-foreground">
                Last changed 30 days ago
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" className="text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}
