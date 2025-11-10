import React, { useState, useEffect, useRef } from 'react';
import ExcelJS from 'exceljs';

/**
 * 在宅支援達成度評価の印刷モーダル
 * エクセルテンプレートを読み込み、データを当てはめて表示・印刷・ダウンロード可能にする
 */
const MonthlyReportPrintModal = ({ isOpen, onClose, evaluationData, student, periodStart, periodEnd }) => {
  const [excelData, setExcelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && evaluationData) {
      loadExcelTemplate();
    }
    
  }, [isOpen, evaluationData]);

  // エクセルテンプレートを読み込んでデータを埋め込む（ExcelJSを使用して完全なスタイル保持）
  const loadExcelTemplate = async () => {
    setIsLoading(true);
    try {
      // テンプレートファイルを読み込む
      const templatePath = '/doc/reports/monthly_report_template.xlsx';
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error('テンプレートファイルの読み込みに失敗しました');
      }
      
      // テンプレートのバイナリデータを取得
      const templateArrayBuffer = await response.arrayBuffer();
      
      // ExcelJSでテンプレートを読み込み（完全なスタイル情報を保持）
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateArrayBuffer);
      
      // 最初のシートを取得（または指定されたシート名）
      const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];
      const sheetName = worksheet.name;
      
      // データを埋め込む（テンプレートの完全な構造とスタイルを保持）
      await fillExcelDataWithExcelJS(worksheet);
      
      setExcelData({ workbook, worksheet, sheetName });
    } catch (error) {
      console.error('エクセルテンプレート読み込みエラー:', error);
      alert('エクセルテンプレートの読み込みに失敗しました: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 西暦を和暦（令和）に変換する関数
  const convertToWareki = (westernYear, month = 1, day = 1) => {
    // 令和の開始日: 2019年5月1日
    const reiwaStartDate = new Date(2019, 4, 1); // 月は0始まりなので4が5月
    const targetDate = new Date(westernYear, month - 1, day);
    
    if (targetDate < reiwaStartDate) {
      // 令和より前の場合は平成年を計算（1989年1月8日から）
      const heiseiStartDate = new Date(1989, 0, 8);
      if (targetDate >= heiseiStartDate) {
        const heiseiYear = westernYear - 1988;
        return { era: '平成', year: heiseiYear, month, day };
      }
      // それより前は昭和など
      return { era: '昭和', year: westernYear - 1925, month, day };
    }
    
    // 令和年を計算
    const reiwaYear = westernYear - 2018;
    return { era: '令和', year: reiwaYear, month, day };
  };


  // ExcelJSを使用してデータを埋め込む（完全なスタイル保持）
  const fillExcelDataWithExcelJS = async (worksheet) => {
    // セルの値を更新する関数（ExcelJS - 完全なスタイル保持）
    const updateCell = (cellAddress, value) => {
      if (!cellAddress) return;
      try {
        const cell = worksheet.getCell(cellAddress);
        cell.value = value || '';
        // スタイル情報は既に保持されている（ExcelJSが自動的に保持）
      } catch (e) {
        console.warn(`セル ${cellAddress} の更新に失敗:`, e);
      }
    };

    // マージされたセル範囲にデータを埋め込む関数（左上のセルに書き込む）
    // マージセルは既にテンプレートに定義されているので、左上のセルに書き込むだけでOK
    const updateMergedCell = (startCell, value) => {
      updateCell(startCell, value);
      // マージセル情報は既にテンプレートに含まれているので、追加の処理は不要
    };

    // 日付フォーマット関数（和暦の年、月、日を返す）
    const formatDateParts = (dateStr) => {
      if (!dateStr) return { era: '令和', year: '', month: '', day: '' };
      const date = new Date(dateStr);
      const wareki = convertToWareki(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return wareki;
    };

    // 期間フォーマット関数（和暦）
    const formatPeriod = (start, end) => {
      if (!start || !end) return '';
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startWareki = convertToWareki(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      const endWareki = convertToWareki(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate());
      return `${startWareki.era}${startWareki.year}年${startWareki.month}月${startWareki.day}日 〜 ${endWareki.era}${endWareki.year}年${endWareki.month}月${endWareki.day}日`;
    };

    // 時間フォーマット関数
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      return timeStr;
    };

    // テンプレート構造に基づいて正確なセル位置にデータを埋め込む
    // 固定セル位置を使用（テンプレートの構造に基づく）
    
    // 1. 対象者名 (D4セル)
    if (student?.name) {
      updateCell('D4', student.name);
    }

    // 2. 受給者証番号 (Q4セル)
    if (student?.recipientNumber) {
      updateCell('Q4', student.recipientNumber);
    }

    // 3. 実施日（和暦で入力）
    // テンプレートのラベルから正確な位置を特定
    const today = new Date().toISOString().split('T')[0];
    const dateParts = formatDateParts(today);
    
    // X1セルに現在の月を入力（修正：逆だった）
    try {
      updateCell('X1', dateParts.month);
    } catch (e) {
      console.warn('X1セルの更新エラー:', e);
    }
    
    // V1セルに和暦の年を入力（修正：逆だった）
    try {
      updateCell('V1', dateParts.year);
    } catch (e) {
      console.warn('V1セルの更新エラー:', e);
    }
    
    // 令和年月分のヘッダー（行3）- U1-W1がマージされている場合の年と月
    // 画像から: U1-W1に「令和 10 年 7月分」が表示されている
    // 年と月のセルを特定（U1-W1のマージセル内）
    // 実際のテンプレート構造に合わせて調整が必要な場合があるが、固定位置で試行
    try {
      // 行3に年と月を入力する場合は、実際のセル位置を確認
      // テンプレート構造に応じて調整
    } catch (e) {
      console.warn('令和年月分のセル更新エラー:', e);
    }
    
    // 実施日（行6）- 固定セル位置（修正版）
    // D6に和暦の年を除いた値（例：令和7 → 7）
    updateCell('D6', dateParts.year); // 令和の年のみ（数字）
    
    // I6に記録月、L6に記録日
    updateCell('I6', dateParts.month); // 記録月
    updateCell('L6', dateParts.day); // 記録日
    
    // 実施時間 (Q6に開始、V6に終了)
    if (evaluationData.startTime) {
      updateCell('Q6', formatTime(evaluationData.startTime)); // 実施時間（開始）
    }
    if (evaluationData.endTime) {
      updateCell('V6', formatTime(evaluationData.endTime)); // 実施時間（終了）
    }

    // 5. 実施方法 (D7, F7, H7セルにチェック、その他はK7-M7)
    // 実施方法の処理（チェックボックスの代わりにテキストで記入）
    const method = evaluationData.method === 'その他' && evaluationData.methodOther 
      ? `その他(${evaluationData.methodOther})` 
      : evaluationData.method || '';
    if (method) {
      // チェックボックス形式ではなく、直接テキストを埋め込む
      if (evaluationData.method === '通所') {
        updateCell('D7', '✓');
      } else if (evaluationData.method === '訪問') {
        updateCell('F7', '✓');
      } else if (evaluationData.method === 'その他') {
        updateCell('H7', '✓');
        if (evaluationData.methodOther) {
          updateMergedCell('K7', evaluationData.methodOther);
        }
      }
    }

    // 6. 訓練目標 (D9セル)
    if (evaluationData.trainingGoal) {
      updateCell('D9', evaluationData.trainingGoal);
    }

    // 7. 取組内容 (D12セル)
    if (evaluationData.workContent) {
      updateCell('D12', evaluationData.workContent);
    }

    // 8. 訓練目標に対する達成度 (D15セル)
    if (evaluationData.achievement) {
      updateCell('D15', evaluationData.achievement);
    }

    // 9. 課題 (D19セル)
    if (evaluationData.issues) {
      updateCell('D19', evaluationData.issues);
    }

    // 10. 今後における課題の改善方針 (D22セル)
    if (evaluationData.improvementPlan) {
      updateCell('D22', evaluationData.improvementPlan);
    }

    // 11. 健康・体調面での留意事項 (D25セル)
    if (evaluationData.healthNotes) {
      updateCell('D25', evaluationData.healthNotes);
    }

    // 12. その他特記事項 (D28セル)
    if (evaluationData.otherNotes) {
      updateCell('D28', evaluationData.otherNotes);
    }

    // 13. 在宅就労継続の妥当性（テンプレート構造に基づいて適切な位置に配置）
    // テンプレートの行31付近を確認して適切なセルに埋め込む
    if (evaluationData.continuityValidity) {
      // 行31のD列あたりを試す（テンプレート構造に応じて調整）
      try {
        const cell = worksheet.getCell('D31');
        if (cell && !cell.isMerged) {
          updateCell('D31', evaluationData.continuityValidity);
        } else {
          // マージセルの場合は左上セルを探す
          updateCell('D31', evaluationData.continuityValidity);
        }
      } catch (e) {
        console.warn('在宅就労継続の妥当性のセルが見つかりません:', e);
      }
    }

    // 14. 評価実施者（D34セル）
    if (evaluationData.evaluator) {
      updateCell('D34', evaluationData.evaluator);
    }

    // 15. 対象者署名（Q36セル）
    if (evaluationData.studentSignature) {
      updateCell('Q36', evaluationData.studentSignature);
    }

    // 16. 前回の達成度評価日（S34に年、V34に月、X34に日）
    if (evaluationData.previousEvaluationDate) {
      const prevDateParts = formatDateParts(evaluationData.previousEvaluationDate);
      // S34に前回実施年（和暦で年は不要 = 数字のみ）
      updateCell('S34', prevDateParts.year);
      // V34に前回実施月（数字のみ）
      updateCell('V34', prevDateParts.month);
      // X34に前回実施日（数字のみ）
      updateCell('X34', prevDateParts.day);
    }

    // コンソールにデバッグ情報を出力
    console.log('データ埋め込み完了（ExcelJS使用）:', {
      対象者: student?.name,
      受給者証番号: student?.recipientNumber,
      実施日: `${dateParts.era}${dateParts.year}年${dateParts.month}月${dateParts.day}日`,
      訓練目標: evaluationData.trainingGoal ? 'あり' : 'なし',
      取組内容: evaluationData.workContent ? 'あり' : 'なし',
      達成度: evaluationData.achievement ? 'あり' : 'なし',
    });
  };

  // エクセルファイルをダウンロード（ExcelJS使用）
  const downloadExcel = async () => {
    if (!excelData) return;

    try {
      // ExcelJSワークブックをバイナリ形式に変換（完全なスタイル保持）
      const excelBuffer = await excelData.workbook.xlsx.writeBuffer();

      // Blobを作成
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // ダウンロード
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // ファイル名を生成
      const fileName = `在宅支援達成度評価_${student?.name || '未設定'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('エクセルダウンロードエラー:', error);
      alert('エクセルのダウンロードに失敗しました: ' + error.message);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-7xl flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-2xl font-bold">📄 在宅支援達成度評価</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">エクセルテンプレートを読み込んでいます...</p>
              </div>
            </div>
          ) : excelData ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">エクセルデータの準備が完了しました。</p>
              <p className="text-sm text-gray-500">下のボタンから操作を選択してください。</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              エクセルデータの読み込みに失敗しました
            </div>
          )}
        </div>

        {/* フッター - ボタンエリアと統合 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600 mb-3">
            <p>対象者: {student?.name || '未設定'} | 期間: {periodStart && periodEnd ? `${periodStart} 〜 ${periodEnd}` : '未設定'}</p>
          </div>
          
          {/* ボタンエリア - 1:1:1のバランスで配置 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                // 保存処理（必要に応じて実装）
                onClose();
              }}
              disabled={isLoading || !excelData}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isLoading || !excelData
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              保存
            </button>
            <button
              onClick={downloadExcel}
              disabled={isLoading || !excelData}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isLoading || !excelData
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              📥 Excelダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReportPrintModal;

