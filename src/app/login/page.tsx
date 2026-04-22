import { Moon } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-5">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4">
            <Moon className="text-white" size={32} />
          </div>
          <h1 className="text-display text-gray-900">수면장애 클리닉</h1>
          <p className="text-body text-gray-500 mt-1">원광대학교 광주한방병원</p>
        </div>
        <div className="card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">등록번호</label>
            <input type="text" placeholder="병원 등록번호 입력"
              className="flex w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <input type="password" placeholder="비밀번호 입력"
              className="flex w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]" />
          </div>
          <button className="btn-primary w-full">로그인</button>
        </div>
      </div>
    </div>
  );
}
