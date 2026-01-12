import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SamlLoginDialog = ({ open, onOpenChange }: Props) => {
  const [companyCode, setCompanyCode] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SAMLでログイン</DialogTitle>
          <DialogDescription>SAMLでログインするには、会社コードを入力してください。</DialogDescription>
        </DialogHeader>
        <Label htmlFor="companyCodeForSamlLogin">会社コード</Label>
        <Input
          id="companyCodeForSamlLogin"
          value={companyCode}
          onChange={(e) => setCompanyCode(e.target.value)}
        />
        <Button>
          <Link to={`/signin/${companyCode}`} className="flex items-center">
            <span>SAMLでログイン</span>
            <ArrowRightIcon />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default SamlLoginDialog
