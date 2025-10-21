import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { AiComboRequest, AiGeneratedCombo } from '../types';

export const useGemini = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCombo = async (request: AiComboRequest): Promise<AiGeneratedCombo | null> => {
    setIsLoading(true);
    setError(null);

    if (!process.env.API_KEY) {
      setError("APIキーが設定されていません。");
      setIsLoading(false);
      return null;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const schema = {
        type: Type.OBJECT,
        properties: {
          partIds: {
            type: Type.ARRAY,
            description: '構築したコンボのパーツIDの配列。提供されたリストにあるIDのみを使用すること。',
            items: { type: Type.STRING },
          },
          explanation: {
            type: Type.STRING,
            description: 'なぜこのコンボが最適なのか、簡潔な日本語での解説。最後に必ず指定された注意文を含めること。',
          },
        },
        required: ['partIds', 'explanation'],
      };

      const prompt = `
あなたは世界クラスのストリートファイター6のプロプレイヤー兼コーチです。
あなたの仕事は、与えられた条件に基づいて、最高のコンボを組み立てることです。あなたの提案は100%正確でなければなりません。

# 最重要ルール
- **絶対にゲームシステム上不可能な連携を提案・解説してはいけません。** 例えば、「強昇竜拳からSA2でキャンセル」のような誤った情報を提示することは固く禁じられています。
- **ストリートファイター6のキャンセルルールを厳守してください。**
    - 通常技は必殺技、スーパーアーツ(SA)、ドライブインパクト、ドライブラッシュでキャンセルできます。
    - 多くの必殺技はSAでキャンセルできます。
    - **キャラクター固有のキャンセルルールを尊重してください。例えばリュウの場合、昇竜拳（強、中、弱、OD）からキャンセル可能なのはSA3のみです。SA1やSA2ではキャンセルできません。**
- **あなたの知識が不確かなコンボは提案しないでください。** キャラクターの浮き状態や相手との距離など、非常に細かい状況によってコンボの成否は変わります。100%確実だと判断できる連携のみを提案してください。
- このようなルールを絶対に破らないでください。

# 制約事項
- 必ず、以下の「利用可能なコンボパーツリスト」に含まれるパーツの \`id\` のみを使用してコンボを構築してください。
- リストにないパーツやIDを創作してはいけません。
- 最終的な出力は、指定されたJSONスキーマに厳密に従ってください。
- コンボは、実際に繋がる組み合わせでなければなりません。ダメージ、フレーム、条件タグを考慮してください。
- 提案するコンボは、最低1つのパーツを含んでいなければなりません。空のコンボは提案しないでください。
- **解説文の最後に、必ず以下の注意文を改行なしで追記してください。「（注意：AIの提案は、ゲームのアップデートや特定の状況により、100%の正確性を保証するものではありません。）」**

# 条件
- キャラクター: ${request.character}
- 目的: ${request.conditions.purpose}
- 画面位置: ${request.conditions.position}
- 始動技: ${request.conditions.starter}
- 使用ドライブゲージ上限: ${request.conditions.driveGauge}本
- 使用SAゲージ: ${request.conditions.saGauge}

# 利用可能なコンボパーツリスト (JSON)
${JSON.stringify(request.parts, null, 2)}

上記の条件とルールを基に、最適なコンボを提案してください。解説文には、ゲームシステム上**確実に正しい情報のみ**を簡潔に含めてください。
`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.2, // 創造性より正確性を重視するため温度を下げる
        },
      });

      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText) as AiGeneratedCombo;
      
      // フロントエンドでの最終検証
      if (!result.partIds || result.partIds.length === 0) {
        throw new Error("AIが有効なコンボを提案できませんでした。");
      }
      for (const id of result.partIds) {
        if (!request.parts.some(p => p.id === id)) {
          throw new Error(`AIがリストに存在しないパーツID (${id}) を返しました。`);
        }
      }

      return result;

    } catch (e) {
      console.error("Gemini API Error:", e);
      setError("コンボの生成中にエラーが発生しました。条件を変えて再度お試しください。");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateCombo, isLoading, error };
};