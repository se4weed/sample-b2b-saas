import type { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";
import type { KeyedMutator } from "swr";
import { FieldSet } from "~/components/shared/fieldset";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { useDeleteActiveSession } from "~/gen/api-client/active-session/active-session";
import type { ActiveSession, ActiveSessions, Ok, UnprocessableEntityError } from "~/gen/api-client/models";
import Text from "~/components/shared/text";
import { Button } from "~/components/ui/button";
import { Caution } from "~/components/shared/caution";
import { useNavigate } from "react-router";
import { useCurrentUserMutators } from "~/globalStates/user";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSession: ActiveSession;
  mutateActiveSession: KeyedMutator<AxiosResponse<ActiveSessions>>;
};

const DestroyActiveSessionDialog = ({ open, onOpenChange, activeSession, mutateActiveSession }: Props) => {
  const { setCurrentUserState } = useCurrentUserMutators();
  const navigate = useNavigate();
  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      if (activeSession.current) {
        setCurrentUserState(null);
        navigate("/signin");
      } else {
        onOpenChange(false);
        mutateActiveSession();
      }
      toast.success(data.data.message ?? "セッションをログアウトしました");
    },
    onError(err: AxiosError<UnprocessableEntityError, unknown>) {
      toast.error(err.response?.data.error);
    },
  };
  const { trigger } = useDeleteActiveSession({ activeSessionId: activeSession.id }, { swr: options });
  const handleDestroy = () => {
    trigger();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>セッションのログアウト</DialogTitle>
        <div className="space-y-4">
          <Text size="md">このセッションをログアウトしますか？</Text>
          <FieldSet title="ブラウザ">{activeSession.userAgent.browser}</FieldSet>
          <FieldSet title="プラットフォーム">{activeSession.userAgent.platform}</FieldSet>
          <FieldSet title="デバイス">{parseDevice(activeSession.userAgent.device)}</FieldSet>
          <FieldSet title="IPアドレス">{activeSession.ipAddress}</FieldSet>
          <FieldSet title="ログイン日時">{new Date(activeSession.createdAt).toLocaleString()}</FieldSet>
        </div>
        {activeSession.current && (
          <Caution>
            <Text size="sm">これは現在のセッションです。ログアウトすると、このセッションからもログアウトされます。</Text>
          </Caution>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="default" onClick={handleDestroy}>
            ログアウト
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DestroyActiveSessionDialog;

const parseDevice = (device: string) => {
  switch (device) {
    case "pc":
      return "PC";
    case "mobile":
      return "モバイル";
    case "tablet":
      return "タブレット";
    case "console":
      return "ゲーム機";
    default:
      return "不明なデバイス";
  }
};
