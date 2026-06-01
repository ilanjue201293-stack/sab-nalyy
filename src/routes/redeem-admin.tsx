import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { redeemAdminCode } from "@/lib/api.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/redeem-admin")({ component: RedeemAdmin });

function RedeemAdmin() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const redeem = useServerFn(redeemAdminCode);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await redeem({ data: { code } });
      await refresh();
      toast.success("You are now an admin!");
      navigate({ to: "/admin" });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="card-elevated p-8">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Redeem admin code</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter the secret code given by an existing admin.</p>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Admin code</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder="SAB-XXXX-XXXX-XXXX-XXXX" /></div>
          <Button type="submit" className="w-full gradient-primary text-white border-0">Redeem</Button>
        </form>
      </div>
    </div>
  );
}
