import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const palette = [
  ["0", "#000000", "黒"], ["1", "#1D2B53", "濃紺"],
  ["2", "#7E2553", "えんじ"], ["3", "#008751", "深緑"],
  ["4", "#AB5236", "茶"], ["5", "#5F574F", "濃灰"],
  ["6", "#C2C3C7", "淡灰"], ["7", "#FFF1E8", "白"],
  ["8", "#FF004D", "赤"], ["9", "#FFA300", "橙"],
  ["A", "#FFEC27", "黄"], ["B", "#00E436", "緑"],
  ["C", "#29ADFF", "青"], ["D", "#83769C", "紫灰"],
  ["E", "#FF77A8", "桃"], ["F", "#FFCCAA", "薄橙"],
] as const;

const instructionGroups = [
  { name: "データ転送", rows: [
    ["MOV Rd, Rs", "(0x00 | d<<2 | s), 0x00", "Rd ← Rs", "—"],
    ["MOV Rd, #imm8", "(0x10 | d<<2), imm8", "Rd ← imm8", "—"],
    ["LD Rd, [Ra]", "(0x40 | d<<2 | a), 0x00", "Rd ← memory[Ra]", "—"],
    ["LD Rd, [addr8]", "(0x41 | d<<2), addr8", "Rd ← memory[addr8]", "—"],
    ["ST [Ra], Rs", "(0x50 | s<<2 | a), 0x00", "memory[Ra] ← Rs", "—"],
    ["ST [addr8], Rs", "(0x51 | s<<2), addr8", "memory[addr8] ← Rs", "—"],
  ]},
  { name: "算術", rows: [
    ["ADD Rd, Rs", "(0x20 | d<<2 | s), 0x00", "Rd ← Rd + Rs", "Z, C"],
    ["SUB Rd, Rs", "(0x20 | d<<2 | s), 0x01", "Rd ← Rd - Rs", "Z, C"],
    ["MUL Rd, Rs", "(0x20 | d<<2 | s), 0x02", "R0:R1 ← Rd × Rs（上位:下位）", "Z, C=0"],
    ["DIV Rd, Rs", "(0x20 | d<<2 | s), 0x03", "R0 ← 商、R1 ← 余り", "Z, C"],
    ["INC Rd", "(0xD0 | d<<2), 0x00", "Rd ← Rd + 1", "Z"],
    ["DEC Rd", "(0xD0 | d<<2), 0x01", "Rd ← Rd - 1", "Z"],
  ]},
  { name: "論理・シフト", rows: [
    ["AND Rd, Rs", "(0x30 | d<<2 | s), 0x00", "Rd ← Rd AND Rs", "Z"],
    ["OR Rd, Rs", "(0x30 | d<<2 | s), 0x01", "Rd ← Rd OR Rs", "Z"],
    ["XOR Rd, Rs", "(0x30 | d<<2 | s), 0x02", "Rd ← Rd XOR Rs", "Z"],
    ["NOT Rd", "(0x30 | d<<2), 0x03", "Rd ← NOT Rd", "Z"],
    ["SHL Rd", "(0x30 | d<<2), 0x04", "1ビット左シフト、bit 7をCへ", "Z, C"],
    ["SHR Rd", "(0x30 | d<<2), 0x05", "論理右シフト、bit 0をCへ", "Z, C"],
    ["ROL Rd", "(0x30 | d<<2), 0x06", "左ローテート、bit 7をCへ", "Z, C"],
    ["ROR Rd", "(0x30 | d<<2), 0x07", "右ローテート、bit 0をCへ", "Z, C"],
  ]},
  { name: "比較・分岐", rows: [
    ["CMP Rd, Rs", "(0x60 | d<<2 | s), 0x00", "Rd - Rs をフラグだけに反映", "Z, C"],
    ["CMP Rd, #imm8", "(0x70 | d<<2), imm8", "Rd - imm8 をフラグだけに反映", "Z, C"],
    ["JMP target", "0x80, target", "targetへ無条件ジャンプ", "—"],
    ["JZ target", "0x90, target", "Z=1ならジャンプ", "—"],
    ["JC target", "0x94, target", "C=1ならジャンプ", "—"],
    ["JNZ target", "0xA0, target", "Z=0ならジャンプ", "—"],
    ["CALL target", "0xB0, target", "戻りPCを積んでジャンプ", "—"],
  ]},
  { name: "スタック", rows: [
    ["PUSH R", "(0xC0 | r), 0x00", "Rをプッシュ", "—"],
    ["POP R", "(0xC0 | r), 0x01", "ポップしてRへ格納 ※下記制限参照", "—"],
    ["PUSHALL", "0xC0, 0xF0", "R3, R2, R1, R0の順でプッシュ", "—"],
    ["POPALL", "0xC0, 0xF1", "R0, R1, R2, R3の順でポップ", "—"],
    ["RET", "0xF0, 0x01", "戻りPCをポップ", "—"],
  ]},
  { name: "バンク・画面・システム", rows: [
    ["BANK bank", "0xE0, bank", "次の通常メモリアクセスにbank & 3を適用", "—"],
    ["NOP", "0xF0, 0x00", "何もしない", "—"],
    ["FLIP", "0xF0, 0x10", "VRAM全体を画面へコピー", "—"],
    ["CLS", "0xF0, 0x11", "画面を色0で消去", "—"],
    ["BCLS", "0xF0, 0x12", "VRAMを色0で消去", "—"],
    ["PLOT", "0xF0, 0x18", "画面へ1ピクセル描画", "—"],
    ["BPLOT", "0xF0, 0x19", "VRAMへ1ピクセル描画", "—"],
    ["BLKCPY", "0xF0, 0x20", "R0からR1へR2バイトコピー", "—"],
    ["VPOKE", "0xF0, 0x21", "VRAM[R0 & 0x7F] ← R1", "—"],
    ["VPEEK", "0xF0, 0x22", "R1 ← VRAM[R0 & 0x7F]", "—"],
    ["HLT", "0xF0, 0xFF", "CPUを停止", "—"],
  ]},
] as const;

function Mono({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-lg font-semibold">{children}</h3>;
}

const cell = "border border-border p-2 align-top";
const head = `${cell} bg-muted text-left font-semibold`;

export function Pico88Specification() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="space-y-2 text-center">
        <h1 className="font-mono text-3xl font-bold">PICO-88 仕様書</h1>
        <p className="text-muted-foreground">シミュレーター実装準拠版 2.3</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">概要・使い方</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">メモリ・I/O</TabsTrigger>
          <TabsTrigger value="graphics">グラフィック</TabsTrigger>
          <TabsTrigger value="isa">命令一覧</TabsTrigger>
          <TabsTrigger value="assembly">記述方法</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card><CardHeader><CardTitle>1. 概要と最短の使い方</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <p>PICO-88は、4本の8ビット汎用レジスタ、8ビットPC、4バンクのRAM、専用スタック、16×16ピクセルの16色画面を備えた教育用の仮想コンピューターです。この文書は、現在のWebシミュレーターで実際に実行される仕様を記載しています。</p>
              <div><SectionTitle>1.1 構成</SectionTitle>
                <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>項目</th><th className={head}>実装値</th></tr></thead><tbody>
                  {[["命令長", "常に2バイト"], ["汎用レジスタ", "R0〜R3（各8ビット）"], ["PC / SP", "各8ビット"], ["メインメモリ", "1,024バイト（256バイト×4バンク）"], ["スタック", "メインメモリとは別の256バイト"], ["画面", "16×16ピクセル、16色、128バイト"], ["裏画面（VRAM）", "128バイト"], ["入出力", "6桁7セグ、8ボタン、時計"]].map(([name, value]) => <tr key={name}><td className={cell}>{name}</td><td className={cell}>{value}</td></tr>)}
                </tbody></table></div>
              </div>
              <div><SectionTitle>1.2 実行手順</SectionTitle>
                <ol className="list-decimal space-y-2 pl-6">
                  <li>シミュレーターのコードエディタにアセンブリを書く。</li>
                  <li><strong>Assemble &amp; Load to Memory</strong>でアセンブルし、バンク0の先頭へロードする。</li>
                  <li><strong>Step</strong>で1命令、<strong>Run</strong>で連続実行する。速度は1〜1000 Hzで指定できる。</li>
                  <li><strong>Reset</strong>は最後にロードしたプログラムを残してCPUと各装置を初期化する。</li>
                </ol>
              </div>
              <div><SectionTitle>1.3 最小プログラム</SectionTitle>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{`// 7セグの左2桁へ 42 (0x2A) を表示
MOV R0, #0x2A
ST [0xF0], R0
HLT`}</pre>
              </div>
              <Note>旧仕様書にあった「16ビットPC」「64KB」「1〜3バイト命令」や <Mono>HALT</Mono>、<Mono>JNC</Mono> は現在の実装にはありません。停止命令は <Mono>HLT</Mono> です。</Note>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cpu" className="space-y-4">
          <Card><CardHeader><CardTitle>2. CPU</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><SectionTitle>2.1 レジスタ</SectionTitle>
                <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>名前</th><th className={head}>幅</th><th className={head}>初期値</th><th className={head}>用途</th></tr></thead><tbody>
                  {[["R0〜R3", "8 bit", "0x00", "汎用。演算、アドレス、描画引数にも使用"], ["PC", "8 bit", "0x00", "次に実行する2バイト命令のバンク0内アドレス"], ["SP", "8 bit", "0xFF", "専用スタックの次の書き込み位置"]].map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={value} className={`${cell} ${index < 3 ? "font-mono" : ""}`}>{value}</td>)}</tr>)}
                </tbody></table></div>
              </div>
              <div><SectionTitle>2.2 フラグ</SectionTitle>
                <ul className="list-disc space-y-2 pl-6">
                  <li><Mono>Z</Mono>: 結果が0なら1。</li>
                  <li><Mono>C</Mono>: 加算の桁あふれ、減算・比較の借り、シフトアウトしたビット、0除算を表す。</li>
                  <li><Mono>N</Mono>: UIには表示されるが、現行CPUではどの命令も更新せず、リセット後は常に0。</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">フラグ表で明記した命令だけがフラグを書き換えます。たとえばINC/DECはZのみを更新し、以前のCを保持します。</p>
              </div>
              <div><SectionTitle>2.3 フェッチとリセット</SectionTitle>
                <ul className="list-disc space-y-2 pl-6">
                  <li>命令はバンク0の <Mono>mainMemory[PC]</Mono> と <Mono>[PC+1]</Mono> から読む。</li>
                  <li>通常は実行前にPCへ2を加え、8ビットで折り返す。</li>
                  <li>分岐先とCALL先は0x00〜0xFF。RETは専用スタックからPCを復元する。</li>
                  <li>HLT後はResetまたは再ロードまでstepを実行しない。</li>
                  <li>Resetはレジスタ、装置、スタックを初期化し、最後にロードしたメインメモリを復元する。</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card><CardHeader><CardTitle>3. メモリとメモリマップドI/O</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><SectionTitle>3.1 メモリ空間</SectionTitle>
                <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>空間</th><th className={head}>サイズ</th><th className={head}>アクセス</th></tr></thead><tbody>
                  {[["メインメモリ", "4 × 256 = 1,024 byte", "命令フェッチ、LD/ST、BLKCPY"], ["スタックメモリ", "256 byte", "PUSH/POP/PUSHALL/POPALL/CALL/RET専用"], ["VRAM（裏画面）", "128 byte", "BPLOT/BCLS/FLIP/VPOKE/VPEEK"], ["フレームバッファ（表画面）", "128 byte", "PLOT/CLS、FLIPのコピー先"], ["7セグメモリ", "3 byte", "I/O 0xF0〜0xF2"]].map((row) => <tr key={row[0]}>{row.map((value) => <td key={value} className={cell}>{value}</td>)}</tr>)}
                </tbody></table></div>
              </div>
              <div><SectionTitle>3.2 バンク</SectionTitle>
                <p>LD/STが使うアドレスは8ビットです。通常はバンク0を参照します。<Mono>BANK n</Mono>を実行すると <Mono>n &amp; 3</Mono> が保存され、その後に行われる次の通常RAMアクセス1回だけに適用されます。物理インデックスは <Mono>bank × 256 + addr8</Mono> です。</p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{`BANK 2
LD R0, [0x40]   // mainMemory[0x240] を読む。BANK指定はここで消費
LD R1, [0x40]   // mainMemory[0x040]（バンク0）を読む`}</pre>
                <Note>BANKは永続的なバンクレジスタではなく「次回アクセス用プレフィックス」です。I/O 0xF0〜0xF6はバンクより優先されます。0xFEの読み出しは保存中のバンク番号を返してプレフィックスを消費します。</Note>
              </div>
              <div><SectionTitle>3.3 8ビットデータアドレスのマップ</SectionTitle>
                <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>アドレス</th><th className={head}>読出し</th><th className={head}>書込み</th></tr></thead><tbody>
                  {[["0x00〜0xEF", "選択バンクのRAM", "選択バンクのRAM"], ["0xF0", "7セグ桁1〜2", "7セグ桁1〜2"], ["0xF1", "7セグ桁3〜4", "7セグ桁3〜4"], ["0xF2", "7セグ桁5〜6", "7セグ桁5〜6"], ["0xF3", "ボタン状態", "無視（読出し専用）"], ["0xF4", "ブラウザの現在時（0〜23）", "無視（読出し専用）"], ["0xF5", "現在分（0〜59）", "無視（読出し専用）"], ["0xF6", "現在秒（0〜59）", "無視（読出し専用）"], ["0xF7〜0xFD", "選択バンクのRAM", "選択バンクのRAM"], ["0xFE", "保留中のバンク番号（なければ0）", "無視"], ["0xFF", "選択バンクのRAM", "選択バンクのRAM"]].map((row) => <tr key={row[0]}><td className={`${cell} font-mono`}>{row[0]}</td><td className={cell}>{row[1]}</td><td className={cell}>{row[2]}</td></tr>)}
                </tbody></table></div>
              </div>
              <div><SectionTitle>3.4 ボタンビット</SectionTitle>
                <p className="mb-3">押している間だけ0xF3の対応ビットが1になります。複数同時押しはORされます。</p>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">{[["bit 0", "↑"], ["bit 1", "↓"], ["bit 2", "←"], ["bit 3", "→"], ["bit 4", "A"], ["bit 5", "B"], ["bit 6", "C"], ["bit 7", "D"]].map(([bit, button]) => <div key={bit} className="rounded border p-2 font-mono">{bit}: {button}</div>)}</div>
              </div>
              <div><SectionTitle>3.5 スタック動作</SectionTitle>
                <p>SPは0xFFから始まります。PUSH/CALLは現在の <Mono>stack[SP]</Mono> へ書いてからSPを1減らし、POP/RETはSPを1増やしてから読みます。すべて8ビットで折り返し、オーバーフロー検出はありません。</p>
              </div>
              <Note>Assemble &amp; Loadは生成データの先頭から最大254バイト（インデックス0x00〜0xFD）だけをバンク0へコピーします。.orgは出力をそのアドレスまで埋めず、CPUの開始PCも変更しません。実行コードは原則0x00から配置してください。</Note>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graphics" className="space-y-4">
          <Card><CardHeader><CardTitle>4. グラフィックと表示装置</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><SectionTitle>4.1 表画面と裏画面</SectionTitle>
                <p>Screen（フレームバッファ）とBuffer（VRAM）は、それぞれ独立した128バイト配列です。<Mono>PLOT</Mono>はScreenへ直接、<Mono>BPLOT</Mono>はBufferへ描きます。<Mono>FLIP</Mono>でBuffer全体をScreenへコピーするため、ちらつきを抑えた一括更新ができます。</p>
              </div>
              <div><SectionTitle>4.2 ピクセル形式</SectionTitle>
                <ul className="list-disc space-y-2 pl-6"><li>解像度は16×16、座標はx=0〜15、y=0〜15。</li><li>1ピクセルは4ビット、1バイトに横2ピクセルを格納する。</li><li>アドレスは <Mono>y × 8 + floor(x / 2)</Mono>。</li><li>偶数xは上位ニブル、奇数xは下位ニブル。値0x0〜0xFが色番号。</li></ul>
              </div>
              <div><SectionTitle>4.3 パレット</SectionTitle>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{palette.map(([index, color, name]) => <div key={index} className="flex items-center gap-2 rounded border p-2 text-sm"><span className="h-7 w-7 shrink-0 rounded border" style={{ backgroundColor: color }} aria-label={color} /><span><span className="font-mono">{index}</span> {name}<br /><span className="font-mono text-xs text-muted-foreground">{color}</span></span></div>)}</div>
              </div>
              <div><SectionTitle>4.4 描画命令の引数</SectionTitle>
                <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>命令</th><th className={head}>入力</th><th className={head}>動作</th></tr></thead><tbody>
                  {[["PLOT", "R1=x, R2=y, R3=color（各下位4bit）", "Screenの1ピクセルを書換え"], ["BPLOT", "R1=x, R2=y, R3=color（各下位4bit）", "Bufferの1ピクセルを書換え"], ["CLS", "なし", "Screenの128バイトを0で消去"], ["BCLS", "なし", "Bufferの128バイトを0で消去"], ["FLIP", "なし", "Bufferの128バイトをScreenへコピー"], ["VPOKE", "R0=byte index, R1=value", "Buffer[R0 & 0x7F]へ1バイト書込み"], ["VPEEK", "R0=byte index", "Buffer[R0 & 0x7F]をR1へ読出し"]].map((row) => <tr key={row[0]}><td className={`${cell} font-mono`}>{row[0]}</td><td className={cell}>{row[1]}</td><td className={cell}>{row[2]}</td></tr>)}
                </tbody></table></div>
              </div>
              <div><SectionTitle>4.5 6桁7セグ表示</SectionTitle>
                <p>0xF0、0xF1、0xF2の各バイトを上位ニブル、下位ニブルの順で表示し、合計6桁の16進数字（0〜F）になります。たとえば <Mono>0xF0 ← 0x2A</Mono> で先頭2桁が「2A」になります。</p>
              </div>
              <div><SectionTitle>4.6 ダブルバッファ描画例</SectionTitle>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{`BCLS
MOV R1, #5       // x
MOV R2, #7       // y
MOV R3, #0xC     // 青
BPLOT            // 裏画面へ描く
FLIP             // 表画面へ反映
HLT`}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isa" className="space-y-4">
          <Card><CardHeader><CardTitle>5. 命令セット</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><SectionTitle>5.1 共通形式</SectionTitle>
                <p>すべての命令は2バイトです。表は「第1バイト, 第2バイト」の順で、<Mono>d</Mono>/<Mono>s</Mono>/<Mono>a</Mono>/<Mono>r</Mono>は0〜3のレジスタ番号です。<Mono>&lt;&lt;</Mono>は左シフト、<Mono>|</Mono>はビットORを表します。</p>
              </div>
              <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>命令</th><th className={head}>エンコード</th><th className={head}>動作</th><th className={head}>更新フラグ</th></tr></thead><tbody>
                {instructionGroups.map((group) => <FragmentRows key={group.name} group={group} />)}
              </tbody></table></div>
              <div><SectionTitle>5.2 補足動作</SectionTitle>
                <ul className="list-disc space-y-2 pl-6 text-sm"><li>演算結果とレジスタは8ビットで切り詰める。</li><li>SUB/CMPのCは借りが発生（左辺&lt;右辺）したとき1。</li><li>MULは16ビット積をR0（上位）とR1（下位）へ格納し、積全体が0ならZ=1。</li><li>DIV成功時は商をR0、余りをR1へ格納。0除算ではC=1となり、R0/R1/Zは変更しない。</li><li>ROL/RORは同じ値の端のビットを反対側へ回す循環シフトで、以前のCは入力に使わない。</li><li>BLKCPYはsrc=R0、dst=R1、len=R2。アドレスは各バイトごとに8ビットで折り返す。</li></ul>
              </div>
              <Note>現行実装の既知の制限: <Mono>POP R1</Mono>〜<Mono>POP R3</Mono>もCPU側ではR0へ格納されます（POP R0は正常）。またアセンブラは即値版 <Mono>AND/OR/XOR Rd, #imm8</Mono> を受理しますが、CPU側に対応処理がなく使用できません。レジスタ版を使用してください。</Note>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assembly" className="space-y-4">
          <Card><CardHeader><CardTitle>6. アセンブリの記述方法</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><SectionTitle>6.1 基本文法</SectionTitle>
                <ul className="list-disc space-y-2 pl-6"><li>命令名、レジスタ名、ラベル名は大文字・小文字を区別しない。</li><li>レジスタはR0〜R3。即値の <Mono>#</Mono> は省略可能。</li><li>数値は10進数または <Mono>0x</Mono> 付き16進数。負数・2進数表記は非対応。</li><li>メモリアドレスは角括弧で囲む: <Mono>LD R0, [0x40]</Mono>。</li><li><Mono>{"//"}</Mono>から行末まではコメント。</li><li><Mono>;</Mono>はコメントではなく、同じ行の複数コマンドを区切る。</li><li>通常命令は必ず2バイトなので、ラベルは原則偶数アドレスになる。</li></ul>
              </div>
              <div><SectionTitle>6.2 ラベルと定数</SectionTitle>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{`.equ LIMIT 16

START:
  MOV R0, #0
LOOP:
  INC R0
  CMP R0, #LIMIT
  JNZ LOOP
  HLT`}</pre>
                <p className="mt-3 text-sm text-muted-foreground">ラベル定義は <Mono>NAME:</Mono> を独立したコマンドとして記述します。定数は <Mono>.equ NAME VALUE</Mono> の順です。ラベルと定数はジャンプ先、即値、直接アドレスに利用でき、最終値は0〜255に収まる必要があります。</p>
              </div>
              <div><SectionTitle>6.3 ディレクティブ</SectionTitle>
                <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr><th className={head}>形式</th><th className={head}>動作</th></tr></thead><tbody>
                  {[[".equ NAME value", "定数を定義。先に定義済みの定数も値に使える"], [".db value ...", "各値を1バイトで出力。カンマ区切りも可"], [".db \"Text\"", "文字列をJavaScriptの文字コード下位8ビットとして出力。空白を含む文字列は非対応"], ["DB value ...", ".dbの数値版として残されている旧形式"], [".dw value ...", "各値を下位、上位のリトルエンディアン2バイトで出力"], [".org address", "ラベル計算とsource mapの現在アドレスを変更。出力のパディングや開始PC変更はしない"]].map((row) => <tr key={row[0]}><td className={`${cell} whitespace-nowrap font-mono`}>{row[0]}</td><td className={cell}>{row[1]}</td></tr>)}
                </tbody></table></div>
              </div>
              <div><SectionTitle>6.4 メモリアクセス例</SectionTitle>
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">{`MOV R0, #0x55
ST [0x40], R0    // 直接: bank 0の0x40へ書く
MOV R1, #0x40
LD R2, [R1]      // 間接: R1をアドレスとして読む

BANK 3
ST [0x80], R2    // bank 3の0x80へ1回だけアクセス

LD R3, [0xF3]    // ボタン状態を読む
HLT`}</pre>
              </div>
              <div><SectionTitle>6.5 エディタ表示</SectionTitle>
                <p>Assembly Modeで編集します。Machine Code Modeへ切り替えると、その時点のアセンブル結果を2バイトずつ4桁16進数にまとめて読取専用表示します。仕様書へ切り替えても、編集中のコード、ロード済みメモリ、CPU状態は保持されます。仕様書の表示中は実行タイマーを停止し、シミュレーターへ戻ると続きから再開します。</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FragmentRows({ group }: { group: (typeof instructionGroups)[number] }) {
  return <><tr><td className={`${cell} bg-muted/60 font-semibold`} colSpan={4}>{group.name}</td></tr>{group.rows.map(([mnemonic, encoding, operation, flags]) => <tr key={mnemonic}><td className={`${cell} whitespace-nowrap font-mono`}>{mnemonic}</td><td className={`${cell} whitespace-nowrap font-mono`}>{encoding}</td><td className={cell}>{operation}</td><td className={`${cell} whitespace-nowrap font-mono`}>{flags}</td></tr>)}</>;
}
