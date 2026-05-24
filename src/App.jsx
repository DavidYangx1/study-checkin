import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Flame, Clock, CalendarDays, Search } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const initialMembers = [
  {
    id: 1,
    name: "David",
    avatar: "D",
    goal: "EJU 日语 / 文数 / 文综",
    streak: 0,
    total: 0,
    checkedToday: false,
    minutes: 0,
    note: "今天还未打卡。",
    tasks: ["日语阅读", "文数错题", "文综复盘"],
  },
  {
    id: 2,
    name: "余静雯",
    avatar: "余",
    goal: "每日学习打卡",
    streak: 0,
    total: 0,
    checkedToday: false,
    minutes: 0,
    note: "今天还未打卡。",
    tasks: ["今日任务", "复盘"],
  },
  {
    id: 3,
    name: "陈夏娇",
    avatar: "陈",
    goal: "每日学习打卡",
    streak: 0,
    total: 0,
    checkedToday: false,
    minutes: 0,
    note: "今天还未打卡。",
    tasks: ["今日任务", "复盘"],
  },
];

export default function App() {
  const [name, setName] = useState("David");
  const [minutes, setMinutes] = useState("120");
  const [tasks, setTasks] = useState("日语阅读, 文数错题");
  const [note, setNote] = useState("今天完成阅读精读和错题复盘。");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("zh-CN")
  );
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("读取历史记录失败：", error);
      return;
    }

    setHistory(data || []);
  }



  const memberNames = ["David", "余静雯", "陈夏娇"];

  function getLatestRecordsByName(records) {
    const latest = {};

    records.forEach((record) => {
      const key = record.name;
      const existing = latest[key];

      if (
        !existing ||
        new Date(record.created_at).getTime() >
        new Date(existing.created_at).getTime()
      ) {
        latest[key] = record;
      }
    });

    return latest;
  }

 function getMonthDays(offset) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const targetMonth = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth() + offset,
    1
  );

  const year = targetMonth.getFullYear();
  const month = targetMonth.getMonth();

  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    if (date < todayDate) continue;

    days.push({
      date: date.toLocaleDateString("zh-CN"),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      weekday: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
    });
  }

  return days;
}

function getMonthTitle(offset) {
  const todayDate = new Date();
  const targetMonth = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth() + offset,
    1
  );

  return `${targetMonth.getFullYear()} 年 ${targetMonth.getMonth() + 1} 月`;
}

  const recordsByDate = useMemo(() => {
    const groups = {};

    history.forEach((record) => {
      if (!groups[record.date]) {
        groups[record.date] = [];
      }
      groups[record.date].push(record);
    });

    const result = {};

    Object.entries(groups).forEach(([date, records]) => {
      result[date] = getLatestRecordsByName(records);
    });

    return result;
  }, [history]);

  const today = new Date().toLocaleDateString("zh-CN");
  const todayRecordsByName = recordsByDate[today] || {};
  const checkedCount = Object.keys(todayRecordsByName).length;
  const totalMinutes = Object.values(todayRecordsByName).reduce(
    (sum, record) => sum + Number(record.minutes || 0),
    0
  );

  const topStreak = 0;

  const calendarDays = useMemo(() => getMonthDays(monthOffset), [monthOffset]);

const calendarTitle = useMemo(() => getMonthTitle(monthOffset), [monthOffset]);

  const selectedRecordsByName = recordsByDate[selectedDate] || {};
  const selectedTotalMinutes = Object.values(selectedRecordsByName).reduce(
    (sum, record) => sum + Number(record.minutes || 0),
    0
  );

  const syncedMembers = useMemo(() => {
    return initialMembers.map((member) => {
      const record = todayRecordsByName[member.name];

      if (!record) {
        return member;
      }

      return {
        ...member,
        checkedToday: true,
        minutes: Number(record.minutes || 0),
        note: record.note || "",
        tasks: record.tasks ? record.tasks.split(" / ") : [],
        streak: 1,
        total: 1,
      };
    });
  }, [todayRecordsByName]);

  const sortedMembers = useMemo(() => {
    return syncedMembers
      .filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.goal.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.minutes - a.minutes || b.streak - a.streak);
  }, [syncedMembers, query]);



  async function handleCheckin() {
    const parsedMinutes = Math.max(0, Number(minutes) || 0);

    const taskList = tasks
      .split(/[，,]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const today = new Date().toLocaleDateString("zh-CN");

    setLoading(true);

    // 先查：这个人今天是否已经打过卡
   const { data: existingRecords, error: selectError } = await supabase

  .from("checkins")

  .select("id")

  .eq("name", name.trim())

  .eq("date", today)

  .order("created_at", { ascending: false })

  .limit(1);

    if (selectError) {
      setLoading(false);
      console.error("查询今日记录失败：", selectError);
      alert("查询今日记录失败，请检查 Supabase 连接。");
      return;
    }

    const newRecord = {
      name: name.trim(),
      date: today,
      minutes: parsedMinutes,
      tasks: taskList.join(" / "),
      note,
    };

    let error;

    // 如果今天已经有记录，就更新；如果没有，就新增
    if (existingRecords && existingRecords.length > 0) {
      const result = await supabase
        .from("checkins")
        .update(newRecord)
        .eq("id", existingRecords[0].id);

      error = result.error;
    } else {
      const result = await supabase
        .from("checkins")
        .insert([newRecord]);

      error = result.error;
    }

    setLoading(false);

    if (error) {
      console.error("提交失败：", error);
      alert("提交失败，请检查 Supabase 表字段是否正确。");
      return;
    }



    await fetchHistory();
    setSelectedDate(today);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="header-label">PRIVATE STUDY LOG</p>
          <h1>Study Circle</h1>
          <p>David / 余静雯 / 陈夏娇 的小群学习打卡系统</p>
        </div>
        <button onClick={() => document.querySelector(".form-card")?.scrollIntoView({ behavior: "smooth" })}>
          去打卡
        </button>
      </header>

      <section className="hero">

        <p className="hero-label">DAILY DISCIPLINE SYSTEM</p>

        <h2>每日打卡，禁止虚报时长</h2>

        <p>

          用统一记录代替口头承诺。每一天的学习时长、任务内容和复盘都会被保存，方便三个人互相监督、追踪进度、复盘执行质量。

        </p>

      </section>

      <section className="stats">
        <div className="stat-card">
          <p>小组人数</p>
          <h3>{memberNames.length} 人</h3>
        </div>
        <div className="stat-card">
          <p>今日已打卡</p>
          <h3>
            {checkedCount}/{memberNames.length}
          </h3>
        </div>
        <div className="stat-card">
          <p>今日总时长</p>
          <h3>{totalMinutes} 分钟</h3>
        </div>
        <div className="stat-card">
          <p>最高连续</p>
          <h3>{topStreak} 天</h3>
        </div>
      </section>

      <main className="main">
        <section className="form-card">
          <h2>快速打卡</h2>

          <label>
            成员
            <select value={name} onChange={(e) => setName(e.target.value)}>
              <option>David</option>
              <option>余静雯</option>
              <option>陈夏娇</option>
            </select>
          </label>

          <label>
            今日学习时长 / 分钟
            <input value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>

          <label>
            任务标签，用逗号隔开
            <input value={tasks} onChange={(e) => setTasks(e.target.value)} />
          </label>

          <label>
            今日复盘
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          <button onClick={handleCheckin} disabled={loading}>

            <CheckCircle2 size={18} />

            {loading ? "提交中..." : "提交今日打卡"}

          </button>
        </section>

        <section className="records">
          <div className="records-top">
            <div>
              <h2>成员打卡记录</h2>
              <p>按今日学习时长和连续天数排序。</p>
            </div>

            <div className="search">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索成员或目标"
              />
            </div>
          </div>

          <div className="member-grid">
            {sortedMembers.map((member, index) => (
              <div className="member-card" key={member.id}>
                <div className="member-head">
                  <div className="avatar">{member.avatar}</div>
                  <div>
                    <h3>{member.name}</h3>
                    <p>{member.goal}</p>
                  </div>
                  <span className="rank">#{index + 1}</span>
                </div>

                <div className="mini-stats">
                  <div>
                    <Flame size={15} />
                    <span>{member.streak} 天</span>
                  </div>
                  <div>
                    <Clock size={15} />
                    <span>{member.minutes} 分钟</span>
                  </div>
                  <div>
                    <CalendarDays size={15} />
                    <span>{member.total} 次</span>
                  </div>
                </div>

                <p className="note">{member.note}</p>

                <div className="tags">
                  {member.tasks.map((task) => (
                    <span key={task}>{task}</span>
                  ))}
                </div>

                <div className={member.checkedToday ? "status done" : "status"}>
                  {member.checkedToday ? "今日已打卡" : "今日未打卡"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <section className="history-card">
       <div className="history-top">
  <div>
    <p className="section-kicker">CHECK-IN CALENDAR</p>
    <h2>年度打卡日历</h2>
    <p>从今天开始向后查看一年内的打卡记录；点击日期查看当天三个人的打卡情况。</p>
  </div>

  <div className="calendar-control">
    <div className="selected-summary">
      <span>{selectedDate}</span>
      <strong>
        已打卡 {Object.keys(selectedRecordsByName).length}/3 人 · 总计{" "}
        {selectedTotalMinutes} 分钟
      </strong>
    </div>

    <div className="month-switch">
      <button
        onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
        disabled={monthOffset === 0}
      >
        上个月
      </button>

      <strong>{calendarTitle}</strong>

      <button
        onClick={() => setMonthOffset((prev) => Math.min(11, prev + 1))}
        disabled={monthOffset === 11}
      >
        下个月
      </button>
    </div>
  </div>
</div>

        <div className="calendar-grid">
          {calendarDays.map((day) => {
            const dayRecords = recordsByDate[day.date] || {};
            const count = Object.keys(dayRecords).length;
            const isSelected = selectedDate === day.date;

            return (
              <button
                key={day.date}
                className={isSelected ? "date-cell selected" : "date-cell"}
                onClick={() => setSelectedDate(day.date)}
              >
                <span className="date-weekday">周{day.weekday}</span>
                <strong>{day.day}</strong>
                <span className="date-month">{day.month}月</span>

                <div className="date-dots">
                  {memberNames.map((memberName) => (
                    <i
                      key={memberName}
                      className={dayRecords[memberName] ? "dot done" : "dot"}
                    />
                  ))}
                </div>

                <small>{count}/3</small>
              </button>
            );
          })}
        </div>

        <div className="selected-day-panel">
          {memberNames.map((memberName) => {
            const record = selectedRecordsByName[memberName];

            return (
              <div
                className={record ? "selected-member done" : "selected-member"}
                key={memberName}
              >
                <div className="selected-member-head">
                  <strong>{memberName}</strong>
                  <span>{record ? "已打卡" : "未打卡"}</span>
                </div>

                {record ? (
                  <>
                    <p className="selected-minutes">{record.minutes} 分钟</p>
                    <p className="selected-tasks">{record.tasks}</p>
                    <p className="selected-note">{record.note}</p>
                  </>
                ) : (
                  <p className="selected-empty">这一天还没有提交记录。</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}