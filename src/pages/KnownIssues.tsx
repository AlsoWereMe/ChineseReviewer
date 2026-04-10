export function KnownIssues() {
  return (
    <section className="card known-issues-page">
      <h1 className="page-title">已发现问题说明</h1>
      <p className="page-lead">以下内容为已发现但暂未及时在题库中完成改动的勘误说明。</p>

      <ol className="known-issues-list">
        <li>
          文学板块中，宋词作品目前为了便于记忆只写了词牌名。实际应补充题目；若无题目，则应带上词的第一句，以避免作品混淆。例如：苏轼《蝶恋花·春景》、李煜《虞美人·春花秋月何时了》。
        </li>
        <li>
          张若虚《春江花月夜》被誉为“孤篇盖全唐”与岳飞《满江红》的“一曲压两宋”属于部分文学工作者的主观判断，可作为参考观点。
        </li>
        <li>
          避讳分类中，避孔子名字讳时采用“避圣讳”。此时不必回避书写“丘”字，而是遇到“丘”字时改写为其他字（如“邱”），或少写、错写笔画。
        </li>
      </ol>

      <p className="known-issues-footer">人力问题无法及时更正、回复反馈提到的问题，请参考此处的文本更正观念</p>
    </section>
  );
}
