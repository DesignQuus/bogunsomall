/**
 * 이메일 발송 헬퍼 (네이버 SMTP)
 * SMTP_USER, SMTP_PASS, SMTP_FROM_NAME 환경변수 사용
 */
import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME ?? "보건소플러스";

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.naver.com",
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * 가입 완료 시 간편 로그인 번호 안내 이메일 발송
 */
export async function sendDeptCodeEmail(params: {
  to: string;
  managerName: string;
  centerName: string;
  centerCode: string;
  deptName: string;
  issuedCode: string;
}) {
  const { to, managerName, centerName, centerCode, deptName, issuedCode } = params;

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>보건소플러스 간편 로그인 번호 안내</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- 헤더 -->
          <tr>
            <td style="background:#00A39B;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">보건소플러스</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">보건소 전용 발주 플랫폼</p>
            </td>
          </tr>
          <!-- 본문 -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#86868b;font-size:14px;">안녕하세요, <strong style="color:#1d1d1f;">${managerName}</strong> 담당자님</p>
              <h2 style="margin:0 0 24px;color:#1d1d1f;font-size:20px;font-weight:700;">가입이 완료되었습니다 🎉</h2>
              <p style="margin:0 0 24px;color:#424245;font-size:15px;line-height:1.6;">
                보건소플러스 회원가입이 완료되었습니다.<br>
                아래 발급된 <strong>간편 로그인 번호</strong>로 로그인하세요.
              </p>

              <!-- 코드 박스 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf9;border:2px solid #00A39B;border-radius:12px;margin:0 0 28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 4px;color:#00A39B;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">발급된 간편 로그인 번호</p>
                    <p style="margin:0;color:#00A39B;font-size:48px;font-weight:800;letter-spacing:12px;">${issuedCode}</p>
                    <p style="margin:8px 0 0;color:#86868b;font-size:12px;">이 코드로 보건소플러스에 로그인하세요</p>
                  </td>
                </tr>
              </table>

              <!-- 가입 정보 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5ea;border-radius:10px;overflow:hidden;margin:0 0 28px;">
                <tr style="background:#f9f9fb;">
                  <td style="padding:10px 16px;color:#86868b;font-size:13px;width:100px;">보건소</td>
                  <td style="padding:10px 16px;color:#1d1d1f;font-size:13px;font-weight:500;">${centerName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#86868b;font-size:13px;border-top:1px solid #e5e5ea;">보건소 코드</td>
                  <td style="padding:10px 16px;color:#00A39B;font-size:13px;font-weight:600;border-top:1px solid #e5e5ea;">${centerCode}</td>
                </tr>
                <tr style="background:#f9f9fb;">
                  <td style="padding:10px 16px;color:#86868b;font-size:13px;border-top:1px solid #e5e5ea;">부서</td>
                  <td style="padding:10px 16px;color:#1d1d1f;font-size:13px;font-weight:500;border-top:1px solid #e5e5ea;">${deptName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#86868b;font-size:13px;border-top:1px solid #e5e5ea;">담당자</td>
                  <td style="padding:10px 16px;color:#1d1d1f;font-size:13px;font-weight:500;border-top:1px solid #e5e5ea;">${managerName}</td>
                </tr>
              </table>

              <p style="margin:0;color:#86868b;font-size:13px;line-height:1.6;">
                문의사항이 있으시면 고객센터 <strong style="color:#1d1d1f;">1522-6401</strong>로 연락해 주세요.<br>
                평일 09:00~18:00 운영
              </p>
            </td>
          </tr>
          <!-- 푸터 -->
          <tr>
            <td style="background:#f5f5f7;padding:20px 40px;text-align:center;border-top:1px solid #e5e5ea;">
              <p style="margin:0;color:#86868b;font-size:12px;">© 2026 보건소플러스 · 보건소 및 공공기관 전용</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_USER}>`,
    to,
    subject: `[보건소플러스] 가입 완료 - 간편 로그인 번호: ${issuedCode}`,
    html,
  });
}

/**
 * SMTP 연결 테스트
 */
export async function testSmtpConnection() {
  const transporter = createTransporter();
  await transporter.verify();
  return true;
}
