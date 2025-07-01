import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Pico88Specification() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-mono">
          PICO-88 アーキテクチャ仕様書
        </h1>
        <p className="text-muted-foreground">リビジョン: 2.0</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">メモリ</TabsTrigger>
          <TabsTrigger value="graphics">グラフィック</TabsTrigger>
          <TabsTrigger value="isa">命令セット</TabsTrigger>
          <TabsTrigger value="assembly">アセンブリ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1. 概要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                PICO-88は、教育およびホビー用途を目的として設計された、仮想の8ビットマイクロプロセッサおよびコンピュータアーキテクチャです。
                この仕様書は、PICO-88のアセンブリ言語プログラマ、およびシステムエミュレータ開発者向けに、アーキテクチャの技術的な詳細を完全に規定するものです。
              </p>

              <div>
                <h3 className="text-lg font-semibold mb-2">1.1. 設計思想</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>学習の容易さ:</strong>{" "}
                    最小限のレジスタセットと直感的な命令セットにより、初心者でもコンピュータの基本動作を容易に理解できます。
                  </li>
                  <li>
                    <strong>拡張性:</strong>{" "}
                    シンプルなコアながら、メモリバンキングやメモリマップドI/Oを通じて、グラフィックやサウンドといった複雑な機能を実現できる拡張性を持ちます。
                  </li>
                  <li>
                    <strong>完全な規定:</strong>{" "}
                    このドキュメントは、PICO-88上で動作するあらゆるソフトウェアと、PICO-88を再現するあらゆるハードウェア（エミュレータ）が互換性を保つための唯一の公式な仕様を定めます。
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  1.2. アーキテクチャの主な特徴
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>8ビットCISC CPUコア:</strong>{" "}
                    複数のアドレッシングモードを持つ、可変長命令セット（1〜3バイト）を採用した8ビットCPU。
                  </li>
                  <li>
                    <strong>16ビットアドレス空間:</strong>{" "}
                    0x0000から0xFFFFまでの64KBのメインメモリ空間をアドレッシング可能。
                  </li>
                  <li>
                    <strong>メモリバンキングシステム:</strong>{" "}
                    メインメモリを256バイト単位のバンクに分割し、BANK命令で切り替えることで64KB全域にアクセスします。
                  </li>
                  <li>
                    <strong>分離されたメモリ空間:</strong>{" "}
                    プログラムやデータを格納するメインメモリとは別に、スタック専用の256バイトのメモリ空間を持ちます。
                  </li>
                  <li>
                    <strong>メモリマップドI/O (MMIO):</strong>{" "}
                    周辺機器はメインメモリ空間の特定のアドレスにマッピングされ、通常のメモリアクセス命令で制御します。
                  </li>
                  <li>
                    <strong>タイルベースのグラフィック:</strong>{" "}
                    VRAM（タイルマップ）とフレームバッファ（ピクセルデータ）の二層構造で制御され、高速な画面更新が可能です。
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  1.3. サポートとフィードバック
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>不具合の報告:</strong>{" "}
                    シミュレータや仕様書に関する不具合、改善要望は以下のGitHubリポジトリのIssuesページまでお知らせください。
                  </p>
                  <p className="text-sm">
                    <a
                      href="https://github.com/GenichiMaruo/pico-88/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      https://github.com/GenichiMaruo/pico-88/issues
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cpu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>2. CPUコア仕様</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  2.1. プログラマブルレジスタ
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">
                          レジスタ名
                        </th>
                        <th className="border border-border p-2 text-left">
                          サイズ
                        </th>
                        <th className="border border-border p-2 text-left">
                          説明
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          R0 - R3
                        </td>
                        <td className="border border-border p-2">8ビット</td>
                        <td className="border border-border p-2">
                          汎用レジスタ。算術論理演算やデータ転送に使用されます。
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          PC
                        </td>
                        <td className="border border-border p-2">16ビット</td>
                        <td className="border border-border p-2">
                          プログラムカウンタ。次にフェッチする命令が格納されているメインメモリアドレスを指します。
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          SP
                        </td>
                        <td className="border border-border p-2">8ビット</td>
                        <td className="border border-border p-2">
                          スタックポインタ。スタックメモリ内のアドレスを指します。スタックは下位アドレス（0x00方向）に向かって成長し、初期値は0xFFです。PUSHでデクリメント、POPでインクリメントされます。
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          FLAGS
                        </td>
                        <td className="border border-border p-2">8ビット</td>
                        <td className="border border-border p-2">
                          フラグレジスタ。直前の算術論理演算の結果の状態を保持します。
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  2.2. 内部・ステータスレジスタ
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  これらのレジスタはCPU内部に存在しますが、BANK命令を除き、特定の命令で間接的に操作されるもので、プログラマが直接値を読み書きすることはできません。
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">
                          レジスタ名
                        </th>
                        <th className="border border-border p-2 text-left">
                          サイズ
                        </th>
                        <th className="border border-border p-2 text-left">
                          説明
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          BANK
                        </td>
                        <td className="border border-border p-2">8ビット</td>
                        <td className="border border-border p-2">
                          バンク選択レジスタ。現在アクティブなメインメモリのバンク番号（0-255）を保持します。BANK命令によってのみ変更可能です。
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  2.3. フラグレジスタ (FLAGS)
                </h3>
                <p className="mb-3">
                  FLAGSレジスタの各ビットは以下の意味を持ちます。
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">
                          ビット
                        </th>
                        <th className="border border-border p-2 text-left">
                          名称
                        </th>
                        <th className="border border-border p-2 text-left">
                          説明
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          7
                        </td>
                        <td className="border border-border p-2 font-mono">
                          Z (Zero)
                        </td>
                        <td className="border border-border p-2">
                          演算結果が0x00になった場合に1にセットされます。
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          6
                        </td>
                        <td className="border border-border p-2 font-mono">
                          N (Negative)
                        </td>
                        <td className="border border-border p-2">
                          演算結果の最上位ビット（MSB, bit
                          7）が1の場合（符号付き数として負の場合）に1にセットされます。
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          5-1
                        </td>
                        <td className="border border-border p-2">(予約済み)</td>
                        <td className="border border-border p-2">
                          将来の拡張のために予約されています。常に0です。
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          0
                        </td>
                        <td className="border border-border p-2 font-mono">
                          C (Carry)
                        </td>
                        <td className="border border-border p-2">
                          加算時:
                          8ビットの範囲を超える桁あふれが発生した場合に1にセット。
                          <br />
                          減算時: 桁借りが発生した場合に1にセット。
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>3. メモリアーキテクチャ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                メモリアーキテクチャの詳細については、別途定義されます。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graphics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>4. グラフィックとディスプレイ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                グラフィックとディスプレイの詳細については、別途定義されます。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>5. 命令セットアーキテクチャ (ISA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>PICO-88は可変長命令セット（1〜3バイト）を採用しています。</p>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  5.1. アドレッシングモード
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>レジスタ:</strong> オペランドがレジスタ。例:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      MOV R0, R1
                    </code>
                  </li>
                  <li>
                    <strong>即値 (Immediate):</strong>{" "}
                    オペランドが命令自体に含まれる定数。例:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      LD R0, 0x1A
                    </code>
                  </li>
                  <li>
                    <strong>直接 (Direct):</strong>{" "}
                    オペランドが16ビットのメモリアドレス。例:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">
                      LD R0, [0x1234]
                    </code>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  5.2. 命令フォーマット
                </h3>
                <p className="mb-3">
                  各命令は以下のいずれかのフォーマットにエンコードされます。
                </p>

                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      フォーマット A: レジスタ・レジスタ (1バイト)
                    </h4>
                    <p className="text-sm mb-2">
                      ADD Rd, Rs や MOV Rd, Rs などで使用されます。
                    </p>
                    <div className="bg-background p-3 rounded border">
                      <pre
                        className="text-sm"
                        style={{
                          fontFamily: "Consolas, 'Courier New', monospace",
                        }}
                      >
                        {`| 7   6   5   4 | 3   2 | 1   0 |
|---------------|-------|-------|
|    OPCODE     |  Rd   |  Rs   |`}
                      </pre>
                    </div>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>OPCODE: 4ビットの命令コード</li>
                      <li>
                        Rd: 2ビットの宛先レジスタ (00:R0, 01:R1, 10:R2, 11:R3)
                      </li>
                      <li>Rs: 2ビットのソースレジスタ</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      フォーマット B: レジスタ (1バイト)
                    </h4>
                    <p className="text-sm mb-2">
                      INC R や PUSH R などで使用されます。
                    </p>
                    <div className="bg-background p-3 rounded border">
                      <pre
                        className="text-sm"
                        style={{
                          fontFamily: "Consolas, 'Courier New', monospace",
                        }}
                      >
                        {`| 7   6   5   4   3   2 | 1   0 |
|-----------------------|-------|
|        OPCODE         |   R   |`}
                      </pre>
                    </div>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>OPCODE: 6ビットの命令コード</li>
                      <li>R: 2ビットの対象レジスタ</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      フォーマット C: レジスタ・即値 (2バイト)
                    </h4>
                    <p className="text-sm mb-2">
                      LD R, imm8 や ADD R, imm8 などで使用されます。
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>1バイト目: フォーマットBと同じ (| OPCODE | R |)</li>
                      <li>2バイト目: 8ビットの即値データ (imm8)</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      フォーマット D: レジスタ・直接アドレス (3バイト)
                    </h4>
                    <p className="text-sm mb-2">
                      LD R, [addr16] や ST [addr16], R などで使用されます。
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>1バイト目: フォーマットBと同じ (| OPCODE | R |)</li>
                      <li>
                        2バイト目: 16ビットアドレスの下位8ビット (addr_low)
                      </li>
                      <li>
                        3バイト目: 16ビットアドレスの上位8ビット (addr_high)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      フォーマット E: 直接アドレス / 単体 (1または3バイト)
                    </h4>
                    <p className="text-sm mb-2">
                      JMP addr16 や HALT などで使用されます。
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>1バイト目: 8ビットの命令コード (OPCODE)</li>
                      <li>2-3バイト目 (存在する場合): 16ビットアドレス</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">
                      フォーマット F: 特殊命令 (2バイト)
                    </h4>
                    <p className="text-sm mb-2">
                      FLIP や BANK など、0xF0から始まる命令で使用されます。
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>1バイト目: プレフィックス (0xF0)</li>
                      <li>2バイト目: サブ命令コード</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  5.3. 命令セット詳細
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  r はレジスタ番号 (0..3)、d は宛先レジスタ、s
                  はソースレジスタを示します。
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">
                          Mnemonic
                        </th>
                        <th className="border border-border p-2 text-left">
                          エンコーディング
                        </th>
                        <th className="border border-border p-2 text-left">
                          オペコード
                        </th>
                        <th className="border border-border p-2 text-left">
                          サイズ
                        </th>
                        <th className="border border-border p-2 text-left">
                          説明
                        </th>
                        <th className="border border-border p-2 text-left">
                          フラグ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-muted/50">
                        <td
                          className="border border-border p-2 font-semibold"
                          colSpan={6}
                        >
                          データ転送
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          LD R, imm8
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          000100rr imm8
                        </td>
                        <td className="border border-border p-2 font-mono">
                          1r
                        </td>
                        <td className="border border-border p-2">2</td>
                        <td className="border border-border p-2">
                          レジスタ r に即値 imm8 をロード。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          LD R, [addr16]
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          001000rr addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          2r
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          メモリ [addr16] からレジスタ r にロード。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          ST [addr16], R
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          001100rr addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          3r
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          レジスタ r の値をメモリ [addr16] にストア。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          MOV Rd, Rs
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          0100ddss
                        </td>
                        <td className="border border-border p-2 font-mono">
                          4(d)(s)
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          レジスタ s の値を d にコピー。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>

                      <tr className="bg-muted/50">
                        <td
                          className="border border-border p-2 font-semibold"
                          colSpan={6}
                        >
                          算術演算
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          ADD R, imm8
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          010100rr imm8
                        </td>
                        <td className="border border-border p-2 font-mono">
                          5r
                        </td>
                        <td className="border border-border p-2">2</td>
                        <td className="border border-border p-2">
                          R = R + imm8
                        </td>
                        <td className="border border-border p-2">Z,N,C</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          ADD Rd, Rs
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          0101ddss
                        </td>
                        <td className="border border-border p-2 font-mono">
                          5(d)(s)
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          Rd = Rd + Rs
                        </td>
                        <td className="border border-border p-2">Z,N,C</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          SUB R, imm8
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          011000rr imm8
                        </td>
                        <td className="border border-border p-2 font-mono">
                          6r
                        </td>
                        <td className="border border-border p-2">2</td>
                        <td className="border border-border p-2">
                          R = R - imm8
                        </td>
                        <td className="border border-border p-2">Z,N,C</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          INC R
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          100000rr
                        </td>
                        <td className="border border-border p-2 font-mono">
                          8r
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">R = R + 1</td>
                        <td className="border border-border p-2">Z,N</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          DEC R
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          100100rr
                        </td>
                        <td className="border border-border p-2 font-mono">
                          9r
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">R = R - 1</td>
                        <td className="border border-border p-2">Z,N</td>
                      </tr>

                      <tr className="bg-muted/50">
                        <td
                          className="border border-border p-2 font-semibold"
                          colSpan={6}
                        >
                          比較
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          CMP R, imm8
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          011100rr imm8
                        </td>
                        <td className="border border-border p-2 font-mono">
                          7r
                        </td>
                        <td className="border border-border p-2">2</td>
                        <td className="border border-border p-2">
                          R - imm8 の結果をフラグに反映。
                        </td>
                        <td className="border border-border p-2">Z,N,C</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          CMP Rd, Rs
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          0111ddss
                        </td>
                        <td className="border border-border p-2 font-mono">
                          7(d)(s)
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          Rd - Rs の結果をフラグに反映。
                        </td>
                        <td className="border border-border p-2">Z,N,C</td>
                      </tr>

                      <tr className="bg-muted/50">
                        <td
                          className="border border-border p-2 font-semibold"
                          colSpan={6}
                        >
                          ジャンプ
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          JMP addr16
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          10100000 addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          A0
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          addr16 へ無条件にジャンプ。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          JZ addr16
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          10100001 addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          A1
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          Zフラグが1ならジャンプ。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          JNZ addr16
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          10100010 addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          A2
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          Zフラグが0ならジャンプ。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          JC addr16
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          10100011 addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          A3
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          Cフラグが1ならジャンプ。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          JNC addr16
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          10100100 addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          A4
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          Cフラグが0ならジャンプ。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>

                      <tr className="bg-muted/50">
                        <td
                          className="border border-border p-2 font-semibold"
                          colSpan={6}
                        >
                          スタック操作
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          PUSH R
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          101100rr
                        </td>
                        <td className="border border-border p-2 font-mono">
                          Br
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          レジスタ r の値をスタックにプッシュ。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          POP R
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          110000rr
                        </td>
                        <td className="border border-border p-2 font-mono">
                          Cr
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          スタックからポップしてレジスタ r に格納。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          CALL addr16
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          11010000 addr_lo addr_hi
                        </td>
                        <td className="border border-border p-2 font-mono">
                          D0
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          戻りアドレスをスタックにプッシュし、サブルーチンを呼び出す。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          RET
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          11010001
                        </td>
                        <td className="border border-border p-2 font-mono">
                          D1
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          サブルーチンから復帰する。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>

                      <tr className="bg-muted/50">
                        <td
                          className="border border-border p-2 font-semibold"
                          colSpan={6}
                        >
                          特殊命令
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          BANK imm8
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          11110000 00000000 imm8
                        </td>
                        <td className="border border-border p-2 font-mono">
                          F0 00
                        </td>
                        <td className="border border-border p-2">3</td>
                        <td className="border border-border p-2">
                          [注意] アクティブバンクをimm8に設定。3バイト命令。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          FLIP
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          11110000 00010000
                        </td>
                        <td className="border border-border p-2 font-mono">
                          F0 10
                        </td>
                        <td className="border border-border p-2">2</td>
                        <td className="border border-border p-2">
                          VRAMの内容をフレームバッファに転送し、画面を更新する。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          NOP
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          00000000
                        </td>
                        <td className="border border-border p-2 font-mono">
                          00
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          何もしない。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2 font-mono">
                          HALT
                        </td>
                        <td className="border border-border p-2 font-mono text-xs">
                          11111111
                        </td>
                        <td className="border border-border p-2 font-mono">
                          FF
                        </td>
                        <td className="border border-border p-2">1</td>
                        <td className="border border-border p-2">
                          CPUの動作を停止させる。
                        </td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assembly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6. アセンブリ言語</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  6.1. ディレクティブ
                </h3>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="font-mono font-semibold">
                      .org &lt;address&gt;
                    </code>
                    <p className="text-sm mt-1">
                      プログラムの開始アドレス（オリジン）を指定します。
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="font-mono font-semibold">
                      .db &lt;byte1&gt;, &lt;byte2&gt;, ...
                    </code>
                    <p className="text-sm mt-1">
                      1バイトのデータを定義します。文字列も可能です。
                    </p>
                    <p className="text-sm text-muted-foreground">
                      例:{" "}
                      <code className="bg-background px-1 py-0.5 rounded">
                        .db &quot;Hello&quot;, 0
                      </code>
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="font-mono font-semibold">
                      .dw &lt;word1&gt;, &lt;word2&gt;, ...
                    </code>
                    <p className="text-sm mt-1">
                      2バイトのワードデータを定義します（リトルエンディアン）。
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="font-mono font-semibold">
                      label: .equ &lt;value&gt;
                    </code>
                    <p className="text-sm mt-1">
                      ラベルに定数値を割り当てます。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
