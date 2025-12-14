import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import type { Ok, UnprocessableEntityError } from "~/gen/api-client/models";
import { Schema } from "./schema.zod";
import z from "zod";
import { Input } from "~/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import type { AxiosError, AxiosResponse } from "axios";
import { usePostRoles } from "~/gen/api-client/roles/roles";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutateRoles: () => void;
};
export const CreateDialog = ({ open, onOpenChange, mutateRoles }: Props) => {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const options = {
    onSuccess(data: AxiosResponse<Ok>) {
      onOpenChange(false);
      toast.success(data.data.message);
      mutateRoles();
    },
    onError(error: AxiosError<UnprocessableEntityError, unknown>) {
      if (error.response) {
        toast.error(error?.response?.data?.error || `ロールの作成に失敗しました。（${error.response.status}）`);
      } else {
        toast.error("予期せぬエラーが発生しました。");
      }
    },
  };
  const { trigger } = usePostRoles({ swr: options });

  const handleSubmit = (values: z.infer<typeof Schema>) => {
    trigger(values);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ロールの作成</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ロール名</FormLabel>
                  <FormDescription>ロールの名前を入力してください。</FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>権限タイプ</FormLabel>
                  <FormDescription>ロールの権限タイプを選択してください。</FormDescription>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">管理者</SelectItem>
                        <SelectItem value="general">一般</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="w-full justify-end flex space-x-1">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </FormItem>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
