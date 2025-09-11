/**
 * 証明書印刷機能
 * A4サイズ1枚に最適化された印刷レイアウト
 */

export const printCertificate = (certificateData) => {
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>修了証明書</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
          margin: 0;
          padding: 0;
          background: white;
        }
        .certificate-print {
          width: 100%;
          max-width: 100%;
          height: auto;
          page-break-inside: avoid;
          background: white;
          border: 8px solid #3B82F6;
          border-radius: 16px;
          padding: 32px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        .certificate-print::before {
          content: '';
          position: absolute;
          top: 16px;
          left: 16px;
          width: 64px;
          height: 64px;
          border: 4px solid #93C5FD;
          border-radius: 50%;
        }
        .certificate-print::after {
          content: '';
          position: absolute;
          top: 16px;
          right: 16px;
          width: 64px;
          height: 64px;
          border: 4px solid #67E8F9;
          border-radius: 50%;
        }
        .certificate-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .certificate-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin-bottom: 24px;
        }
        .certificate-logo-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3B82F6, #06B6D4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: bold;
        }
        .certificate-company {
          text-align: left;
        }
        .certificate-company h3 {
          font-size: 24px;
          font-weight: bold;
          color: #1F2937;
          margin: 0 0 8px 0;
        }
        .certificate-company p {
          color: #6B7280;
          margin: 0 0 4px 0;
          font-size: 14px;
        }
        .certificate-title {
          text-align: center;
          margin-bottom: 48px;
        }
        .certificate-title h1 {
          font-size: 36px;
          font-weight: bold;
          background: linear-gradient(135deg, #2563EB, #0891B2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px 0;
        }
        .certificate-title p {
          color: #6B7280;
          font-size: 18px;
          margin: 0;
        }
        .certificate-body {
          margin-bottom: 48px;
        }
        .certificate-description {
          font-size: 18px;
          color: #374151;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .certificate-description .lesson-title {
          font-weight: bold;
          color: #2563EB;
          margin: 0 8px;
        }
        .certificate-details {
          background: #F9FAFB;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .certificate-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .certificate-detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .certificate-detail-label {
          font-weight: 600;
          color: #374151;
        }
        .certificate-detail-value {
          color: #1F2937;
        }
        .certificate-detail-value.score {
          color: #2563EB;
          font-weight: bold;
        }
        .certificate-detail-value.percentage {
          color: #059669;
          font-weight: bold;
        }
        .certificate-detail-value.cert-id {
          color: #6B7280;
          font-family: monospace;
          font-size: 14px;
        }
        .certificate-signatures {
          text-align: center;
        }
        .certificate-date {
          color: #6B7280;
          margin-bottom: 16px;
        }
        .certificate-signature-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
        }
        .certificate-signature {
          text-align: center;
        }
        .certificate-signature-line {
          width: 96px;
          height: 64px;
          border-bottom: 2px solid #9CA3AF;
          margin-bottom: 8px;
        }
        .certificate-signature-label {
          font-size: 14px;
          color: #6B7280;
        }
        .certificate-signature-name {
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
        }
        .certificate-manager-names {
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
        }
        .certificate-manager-names div {
          margin-bottom: 2px;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .certificate-print { 
            border: 8px solid #3B82F6 !important;
            background: white !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate-print">
        <div class="certificate-header">
          <div class="certificate-logo">
            <div class="certificate-logo-icon">
              ${certificateData.officeName ? certificateData.officeName.charAt(0) : 'S'}
            </div>
            <div class="certificate-company">
              <h3>${certificateData.officeName}</h3>
              <p>${certificateData.companyName}</p>
              <p>${certificateData.officeAddress || ''}</p>
              ${certificateData.officePhone ? `<p>TEL: ${certificateData.officePhone}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="certificate-title">
          <h1>修了証明書</h1>
          <p>Certificate of Completion</p>
        </div>

        <div class="certificate-body">
          <p class="certificate-description">
            この証明書は、下記の方が
            <span class="lesson-title">${certificateData.lessonTitle}</span>
            の学習を修了したことを証明します。
          </p>

          <div class="certificate-details">
            <div class="certificate-details-grid">
              <div class="certificate-detail-item">
                <span class="certificate-detail-label">氏名</span>
                <span class="certificate-detail-value">${certificateData.studentName}</span>
              </div>
              <div class="certificate-detail-item">
                <span class="certificate-detail-label">利用者ID</span>
                <span class="certificate-detail-value">${certificateData.studentId}</span>
              </div>
              <div class="certificate-detail-item">
                <span class="certificate-detail-label">修了日</span>
                <span class="certificate-detail-value">${certificateData.completionDate}</span>
              </div>
              <div class="certificate-detail-item">
                <span class="certificate-detail-label">テスト結果</span>
                <span class="certificate-detail-value score">${certificateData.score}点</span>
              </div>
              <div class="certificate-detail-item">
                <span class="certificate-detail-label">正答率</span>
                <span class="certificate-detail-value percentage">${certificateData.percentage}%</span>
              </div>
              <div class="certificate-detail-item">
                <span class="certificate-detail-label">証明書ID</span>
                <span class="certificate-detail-value cert-id">${certificateData.certificateId}</span>
              </div>
            </div>
          </div>

          <div class="certificate-signatures">
            <p class="certificate-date">${certificateData.completionDate}</p>
            <div class="certificate-signature-row">
              ${certificateData.instructorName ? `
                <div class="certificate-signature">
                  <div class="certificate-signature-line"></div>
                  <p class="certificate-signature-label">指導員</p>
                  <p class="certificate-signature-name">${certificateData.instructorName}</p>
                </div>
              ` : ''}
              ${certificateData.managerNames && certificateData.managerNames.length > 0 ? `
                <div class="certificate-signature">
                  <div class="certificate-signature-line"></div>
                  <p class="certificate-signature-label">拠点管理者</p>
                  <div class="certificate-manager-names">
                    ${certificateData.managerNames.map(name => `<div>${name}</div>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // 印刷ダイアログを開く
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
