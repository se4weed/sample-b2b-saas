import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError, AxiosResponse } from "axios";
import { LoaderCircle, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "~/components/shared/container";
import Text from "~/components/shared/text";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Ok, ServiceProvider, UnprocessableEntityError } from "~/gen/api-client/models";
import { useGetSamlSetting, usePatchSamlSetting } from "~/gen/api-client/saml-settings/saml-settings";
import { toast } from "sonner";
import { Schema } from "./schema.zod";
import { useEffect } from "react";
import { Select, SelectItem } from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

const SamlSettings = () => {
  const { data, isLoading, mutate } = useGetSamlSetting();

  const samlSetting = data?.data?.samlSetting;
  const serviceProvider = data?.data?.serviceProvider;

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      entityId: "",
      ssoUrl: "",
      idpX509Certificate: "",
      samlRequestMethod: "GET",
    },
  });

  useEffect(() => {
    if (samlSetting) {
      form.reset(samlSetting);
    }
  }, [form, samlSetting]);

  const mutationOptions = {
    onSuccess(response: AxiosResponse<Ok>) {
      toast.success(response.data.message ?? "SAML設定を更新しました");
      mutate();
    },
    onError(error: AxiosError<UnprocessableEntityError>) {
      if (error.response) {
        toast.error(error.response.data?.error ?? "SAML設定の更新に失敗しました");
      } else {
        toast.error("ネットワークエラーが発生しました");
      }
    },
  };

  const { trigger, isMutating } = usePatchSamlSetting({ swr: mutationOptions });

  const handleSubmit = (values: z.infer<typeof Schema>) => {
    trigger(values);
  };

  const isInitialLoading = isLoading && !data;

  return (
    <Container className="space-y-6">
      <div className="space-y-1">
        <Text type="title">SAML設定</Text>
        <Text type="description">IdPから払い出された情報を設定し、SAMLシングルサインオンを有効化します。</Text>
      </div>
      {isInitialLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {serviceProvider && <ServiceProviderCard serviceProvider={serviceProvider} />}
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Identity Provider設定
                </CardTitle>
                <CardDescription>エンティティID、SSO URL、IdP証明書を入力してください。</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={"outline"}>{serviceProvider ? "有効" : "未設定"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading || !samlSetting ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
              ) : (
                <Form {...form}>
                  <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                      control={form.control}
                      name="entityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>エンティティID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ssoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SSO URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="idpX509Certificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IdP X.509証明書</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-40 font-mono text-xs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                        />
                    <FormField
                      control={form.control}
                      name="samlRequestMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAMLリクエスト送信方法</FormLabel>
                          <FormControl>
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                              <div className="flex items-center gap-3">
                                <RadioGroupItem id="samlRequestMethod-GET" value="GET" />
                                <Label htmlFor="samlRequestMethod-GET">GET</Label>
                              </div>
                              <div className="flex items-center gap-3">
                                <RadioGroupItem id="samlRequestMethod-POST" value="POST" />
                                <Label htmlFor="samlRequestMethod-POST">POST</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isMutating}>
                      保存
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default SamlSettings;

type ServiceProviderCardProps = {
  serviceProvider: ServiceProvider;
};

const ServiceProviderCard = ({ serviceProvider }: ServiceProviderCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Service Provider情報</CardTitle>
          <CardDescription>IdP設定時に利用するサービスプロバイダーの各種URLです。</CardDescription>
        </div>
        <Badge variant="secondary">参照用</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sp-entity-id">SPエンティティID</Label>
          <Text className="p-1 bg-gray-100 font-mono text-sm">{serviceProvider.entityId}</Text>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sp-acs-url">ACS URL</Label>
          <Text className="p-1 bg-gray-100 font-mono text-sm">{serviceProvider.acsUrl}</Text>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sp-initiate-url">開始URL</Label>
          <Text className="p-1 bg-gray-100 font-mono text-sm">{serviceProvider.initiateUrl}</Text>
        </div>
      </CardContent>
    </Card>
  );
};
