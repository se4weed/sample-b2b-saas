import { BadgeCheck, Gamepad, Laptop2, LoaderCircle, ShieldQuestionMark, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import Text from "~/components/shared/text";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useGetActiveSessions } from "~/gen/api-client/active-sessions/active-sessions";
import type { ActiveSession, Ok, UnprocessableEntityError } from "~/gen/api-client/models";
import DestroyActiveSessionDialog from "./DestroyActiveSessionDialog";

const AccountAuthentication = () => {
  const { data, mutate: mutateActiveSession, isLoading } = useGetActiveSessions();

  const [destroyActiveSessionDialogOpen, setDestroyActiveSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ActiveSession>();

  const handleDestroySelectedSession = (activeSession: ActiveSession) => {
    setSelectedSession(activeSession);
    setDestroyActiveSessionDialogOpen(true);
  };
  return (
    <div className="space-y-4">
      <Text type="subTitle">認証情報</Text>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <Label>有効なセッション</Label>
            {isLoading ? (
              <div>
                <div className="w-full h-full flex items-center justify-center">
                  <LoaderCircle className="animate-spin" />
                </div>
              </div>
            ) : (
              <div className="w-full rounded-md">
                {data?.data && data.data.activeSessions.length > 0 ? (
                  <div className="">
                    {data.data.activeSessions.map((session) => (
                      <div key={session.id} className="border p-4 flex space-x-4 justify-between">
                        <div className="flex space-x-4 h-full items-center">
                          <div className="flex">{parseDeviceToIcon({ device: session.userAgent.device })}</div>
                          <div>
                            <div className="flex space-x-4">
                              <Text size="md">
                                {session.userAgent.browser} on {session.userAgent.platform}
                              </Text>
                              {session.current && (
                                <Badge variant="secondary" className="bg-emerald-500 text-white dark:bg-emerald-600">
                                  <BadgeCheck />
                                  現在のセッション
                                </Badge>
                              )}
                            </div>
                            <Text type="description" size="sm">
                              {session.location || session.ipAddress}・{new Date(session.createdAt).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                        <div className="block">
                          <Button variant="outline" onClick={() => handleDestroySelectedSession(session)}>
                            ログアウト
                          </Button>
                        </div>
                      </div>
                    ))}
                    {selectedSession && (
                      <DestroyActiveSessionDialog
                        open={destroyActiveSessionDialogOpen}
                        onOpenChange={setDestroyActiveSessionDialogOpen}
                        activeSession={selectedSession}
                        mutateActiveSession={mutateActiveSession}
                      />
                    )}
                  </div>
                ) : (
                  <p>有効なセッションはありません。</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountAuthentication;

const parseDeviceToIcon = ({ device }: { device: string }) => {
  switch (device) {
    case "pc":
      return <Laptop2 />;
    case "mobile":
      return <Smartphone />;
    case "tablet":
      return <Tablet />;
    case "console":
      return <Gamepad />;
    default:
      return <ShieldQuestionMark />;
  }
};
