import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import { type FallbackProps } from "react-error-boundary";
import { toast } from "sonner";
import Screen from "../shared/screen";
import Center from "../shared/center";
import Text from "../shared/text";

type ErrorType = ApiErrorType | "unexpectedError";
type ApiErrorType =
  | "badRequest"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "unprocessableContent"
  | "tooManyRequests"
  | "internalServerError";

const ErrorFallback = ({ error }: FallbackProps) => {
  const navigate = useNavigate();
  const apiErrorHandler = (apiError: AxiosError): ApiErrorType => {
    switch (apiError.response?.status) {
      case 400:
        toast.error("不正なリクエストです。");
        return "badRequest";
      case 401:
        toast.error("ログインしてください。");
        navigate("/signin");
        return "unauthorized";
      case 403:
        return "forbidden";
      case 404:
        return "notFound";
      case 422:
        return "unprocessableContent";
      case 429:
        toast.error("リクエストが多すぎます。時間をおいて再度お試しください。");
        return "tooManyRequests";
      default:
        return "internalServerError";
    }
  };

  const errorHandler = (error: Error): ErrorType => {
    if (error instanceof AxiosError) {
      return apiErrorHandler(error);
    }
    return "unexpectedError";
  };

  const errorType = errorHandler(error);

  const errorMessageObject = {
    badRequest: {
      title: "不正なリクエストです。",
      messages: [
        "ご入力内容に誤りがないかご確認ください。",
        "問題が解決しない場合は、再度お試しいただくか、サポート窓口までお問い合わせください。",
      ],
    },
    unauthorized: {
      title: "ログインが必要です。",
      messages: ["この操作を行うには、ログインしてください。"],
    },
    forbidden: {
      title: "アクセス権限がありません。",
      messages: ["このページにアクセスする権限がありません。", "アクセスが必要な場合は、管理者にご連絡ください。"],
    },
    notFound: {
      title: "ページが見つかりません。",
      messages: [
        "お探しのページは、一時的にアクセスできない状態にあるか、移動または削除された可能性があります。",
        "URLをご確認の上、再度お試しください。",
      ],
    },
    unprocessableContent: {
      title: "リクエスト処理に失敗しました。",
      messages: ["送信された内容に問題があります。", "内容をご確認の上、もう一度お試しください。"],
    },
    tooManyRequests: {
      title: "短時間に多数のリクエストがありました。",
      messages: ["恐れ入りますが、しばらく時間をおいてから再度お試しください。"],
    },
    internalServerError: {
      title: "サーバーで問題が発生しました。",
      messages: ["ご迷惑をおかけして申し訳ございません。", "しばらく時間をおいてから、もう一度お試しください。"],
    },
    unexpectedError: {
      title: "予期せぬエラーが発生しました。",
      messages: [
        "大変申し訳ございませんが、時間をおいてからもう一度お試しください。",
        "問題が解決しない場合は、サポート窓口までご連絡ください。",
      ],
    },
  };

  return (
    <Screen>
      <Center className="gap-4">
        <Text type="title" size="lg" weight="bold">
          {errorMessageObject[errorType].title}
        </Text>
        <div>
          {errorMessageObject[errorType].messages.map((message, index) => (
            <Text type="description" size="sm" weight="normal" key={index}>
              {message}
            </Text>
          ))}
        </div>

        <Link to="/" className="text-link">
          トップページに戻る
        </Link>
      </Center>
    </Screen>
  );
};

export default ErrorFallback;
