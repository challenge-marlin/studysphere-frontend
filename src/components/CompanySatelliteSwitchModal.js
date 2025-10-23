import React, { useState, useEffect } from 'react';
import { getCompanies, getSatellites, getSatellitesByCompany } from '../utils/api';

const CompanySatelliteSwitchModal = ({ 
  isOpen, 
  onClose, 
  currentCompany, 
  currentSatellite, 
  onCompanySelect, 
  onSatelliteSelect,
  userRole,
  userSatellites 
}) => {
  const [companies, setCompanies] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('satellite'); // 'company' or 'satellite'

  // 権限チェック
  const canSwitchCompany = userRole >= 9;

  useEffect(() => {
    if (isOpen) {
      setSelectedCompany(currentCompany);
      setSelectedSatellite(currentSatellite);
      loadData();
    }
  }, [isOpen, currentCompany, currentSatellite]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('CompanySatelliteSwitchModal loadData開始:', {
        canSwitchCompany,
        userRole,
        userSatellites
      });

      if (canSwitchCompany) {
        const companiesData = await getCompanies();
        console.log('企業データ取得結果:', companiesData);
        
        // APIレスポンスの形式を確認（success/data形式または直接データ形式）
        const companiesArray = companiesData.success ? companiesData.data : companiesData;
        console.log('処理後の企業データ:', companiesArray);
        console.log('処理後の企業データの型:', typeof companiesArray);
        console.log('処理後の企業データが配列か:', Array.isArray(companiesArray));
        console.log('処理後の企業データの長さ:', companiesArray?.length);
        
        setCompanies(Array.isArray(companiesArray) ? companiesArray : []);
      }
      
      // アドミン権限の場合は全拠点を取得、そうでなければ現在の企業に紐づいた拠点のみ
      if (userRole >= 9) {
        const satellitesData = await getSatellites();
        console.log('拠点データ取得結果:', satellitesData);
        console.log('拠点データの型:', typeof satellitesData);
        console.log('拠点データが配列か:', Array.isArray(satellitesData));
        console.log('拠点データの長さ:', satellitesData?.length);
        console.log('拠点データの詳細:', JSON.stringify(satellitesData, null, 2));
        
        // APIレスポンスの形式を確認（success/data形式または直接データ形式）
        const satellitesArray = satellitesData.success ? satellitesData.data : satellitesData;
        console.log('処理後の拠点データ:', satellitesArray);
        console.log('処理後の拠点データの型:', typeof satellitesArray);
        console.log('処理後の拠点データが配列か:', Array.isArray(satellitesArray));
        console.log('処理後の拠点データの長さ:', satellitesArray?.length);
        
        setSatellites(Array.isArray(satellitesArray) ? satellitesArray : []);
      } else if (currentCompany && currentCompany.id) {
        // 指導員の場合は現在の企業に紐づいた拠点のみを取得
        console.log('現在の企業に紐づいた拠点を取得:', currentCompany.id);
        try {
          const satellitesData = await getSatellitesByCompany(currentCompany.id);
          console.log('企業拠点データ取得結果:', satellitesData);
          
          const satellitesArray = satellitesData.success ? satellitesData.data : satellitesData;
          console.log('処理後の企業拠点データ:', satellitesArray);
          
          setSatellites(Array.isArray(satellitesArray) ? satellitesArray : []);
        } catch (error) {
          console.error('企業拠点データ取得エラー:', error);
          // フォールバック: ユーザーの所属拠点を使用
          if (userSatellites && userSatellites.length > 0) {
            console.log('フォールバック: ユーザー拠点データ設定:', userSatellites);
            setSatellites(Array.isArray(userSatellites) ? userSatellites : []);
          }
        }
      } else if (userSatellites && userSatellites.length > 0) {
        console.log('ユーザー拠点データ設定:', userSatellites);
        setSatellites(Array.isArray(userSatellites) ? userSatellites : []);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      // エラー時は空配列を設定
      setCompanies([]);
      setSatellites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyConfirm = () => {
    if (selectedCompany && onCompanySelect) {
      onCompanySelect(selectedCompany);
      onClose();
    }
  };

  const handleSatelliteConfirm = async () => {
    if (selectedSatellite && onSatelliteSelect) {
      try {
        console.log('拠点切り替え確認処理開始:', selectedSatellite);
        await onSatelliteSelect(selectedSatellite);
        onClose();
      } catch (error) {
        console.error('拠点切り替えエラー:', error);
        // エラーが発生した場合はモーダルを閉じない
      }
    }
  };

  // 拠点切り替えの権限チェック
  const canSwitchSatelliteForAdmin = userRole >= 9 && satellites.length > 0;
  const canSwitchSatelliteForUser = (userRole < 9 && satellites.length > 0) || (Array.isArray(userSatellites) && userSatellites.length > 0);
  const canSwitchSatellite = canSwitchSatelliteForAdmin || canSwitchSatelliteForUser;

  // デバッグ情報を追加
  console.log('CompanySatelliteSwitchModal Debug:', {
    userRole,
    satellites: satellites,
    satellitesLength: satellites?.length,
    userSatellites: userSatellites,
    userSatellitesLength: userSatellites?.length,
    canSwitchSatelliteForAdmin,
    canSwitchSatelliteForUser,
    canSwitchSatellite,
    activeTab,
    loading
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">企業・拠点の切り替え</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex border-b border-gray-200 mb-6">
          {canSwitchSatellite && (
            <button
              onClick={() => setActiveTab('satellite')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'satellite'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              拠点切り替え
            </button>
          )}
          {canSwitchCompany && (
            <button
              onClick={() => setActiveTab('company')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'company'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              企業切り替え
            </button>
          )}
        </div>

        {/* 現在の選択状況表示 */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="text-sm text-indigo-700 font-medium">現在選択中</div>
              <div className="text-lg font-bold text-indigo-900">
                {currentCompany?.name || '未選択'} / {currentSatellite?.name || '未選択'}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* 拠点切り替えタブ */}
            {activeTab === 'satellite' && canSwitchSatellite && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">
                  {userRole >= 9 ? '全拠点から選択' : '現在の企業の拠点から選択'}
                </h3>
                {userRole < 9 && userSatellites && userSatellites.length === 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-700">
                      現在1つの拠点にのみ所属しています。拠点切り替えを行うには、管理者に複数拠点への所属を依頼してください。
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {(() => {
                    const satelliteList = satellites || [];
                    console.log('拠点リスト表示:', {
                      userRole,
                      satellites,
                      userSatellites,
                      satelliteList,
                      satelliteListLength: satelliteList.length
                    });
                    return satelliteList.map((satellite) => (
                      <button
                        key={satellite.id}
                        onClick={() => setSelectedSatellite(satellite)}
                        className={`w-full flex items-center p-4 rounded-lg transition-all duration-200 ${
                          selectedSatellite?.id === satellite.id
                            ? 'bg-indigo-50 border-2 border-indigo-500'
                            : 'bg-gray-50 border-2 border-transparent hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-2xl">
                            {satellite.office_type_name?.includes('学習塾') ? '📚' : 
                             satellite.office_type_name?.includes('就労移行') ? '🏢' :
                             satellite.office_type_name?.includes('A型') ? '🏭' :
                             satellite.office_type_name?.includes('B型') ? '🏗️' : '🏫'}
                          </span>
                          <div className="text-left">
                            <div className="font-medium text-gray-800">{satellite.name}</div>
                            <div className="text-sm text-gray-600">{satellite.office_type_name}</div>
                          </div>
                        </div>
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ml-4 ${
                          selectedSatellite?.id === satellite.id
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedSatellite?.id === satellite.id && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* 企業切り替えタブ */}
            {activeTab === 'company' && canSwitchCompany && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">企業から選択</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(companies || []).map((company) => (
                    <button
                      key={company.id}
                      onClick={() => setSelectedCompany(company)}
                      className={`w-full flex items-center p-4 rounded-lg transition-all duration-200 ${
                        selectedCompany?.id === company.id
                          ? 'bg-indigo-50 border-2 border-indigo-500'
                          : 'bg-gray-50 border-2 border-transparent hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-2xl">🏢</span>
                        <div className="text-left">
                          <div className="font-medium text-gray-800">{company.name}</div>
                          <div className="text-sm text-gray-600">{company.address}</div>
                        </div>
                      </div>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ml-4 ${
                        selectedCompany?.id === company.id
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedCompany?.id === company.id && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 権限不足メッセージ */}
            {!canSwitchCompany && !canSwitchSatellite && (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-gray-600">企業・拠点の切り替え権限がありません</p>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
          >
            キャンセル
          </button>
          {activeTab === 'satellite' && canSwitchSatellite && (
            <button
              onClick={handleSatelliteConfirm}
              disabled={!selectedSatellite}
              className={`flex-1 py-3 px-4 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                ${selectedSatellite
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              この拠点で作業を開始する
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
          {activeTab === 'company' && canSwitchCompany && (
            <button
              onClick={handleCompanyConfirm}
              disabled={!selectedCompany}
              className={`flex-1 py-3 px-4 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                ${selectedCompany
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              この企業で作業を開始する
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySatelliteSwitchModal;
