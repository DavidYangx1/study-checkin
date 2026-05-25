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
    note: "今天还未打卡",
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
    note: "今天还未打卡",
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
    note: "今天还未打卡",
    tasks: ["今日任务", "复盘"],
  },
];
function getDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatInputDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("zh-CN");
}

export default function App() {

  const [minutes, setMinutes] = useState("");
  const [tasks, setTasks] = useState("");
  const [note, setNote] = useState("");
  const [checkinDate, setCheckinDate] = useState(() => getDateInputValue());
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editMinutes, setEditMinutes] = useState("");
  const [editTasks, setEditTasks] = useState("");
  const [editNote, setEditNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("zh-CN")
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("study-circle-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [inviteCode, setInviteCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("checkin");

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

  async function handleLogin() {
    const code = inviteCode.trim();

    if (!code) {
      setLoginError("请输入邀请码。");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("invite_code", code)
      .limit(1);

    if (error) {
      console.error("登录失败：", error);
      setLoginError("登录失败，请检查网络或 Supabase 设置。");
      return;
    }

    if (!data || data.length === 0) {
      setLoginError("邀请码错误。");
      return;
    }

    const user = data[0];

    setCurrentUser(user);
    localStorage.setItem("study-circle-user", JSON.stringify(user));

    setLoginError("");
  }

  function handleLogout() {
    localStorage.removeItem("study-circle-user");
    setCurrentUser(null);
    setInviteCode("");
  }

  function canEditRecord(record) {
    return currentUser.role === "admin" || currentUser.name === record.name;
  }



  const memberNames = ["David", "余静雯", "陈夏娇"];
  const tabs = [
    { id: "checkin", label: "打卡" },
    { id: "members", label: "成员" },
    { id: "calendar", label: "日历" },
    { id: "report", label: "周报" },
    ...(currentUser.role === "admin" ? [{ id: "admin", label: "管理" }] : []),
  ];

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
  function getRecordsByMember(records) {
    const result = {};

    memberNames.forEach((memberName) => {
      result[memberName] = {};
    });

    records.forEach((record) => {
      if (!record.name || !record.date) return;

      if (!result[record.name]) {
        result[record.name] = {};
      }

      const existing = result[record.name][record.date];

      if (
        !existing ||
        new Date(record.created_at).getTime() >
        new Date(existing.created_at).getTime()
      ) {
        result[record.name][record.date] = record;
      }
    });

    return result;
  }

  function calculateStreak(dateMap) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    let streak = 0;
    const currentDate = new Date(todayDate);

    while (true) {
      const dateKey = currentDate.toLocaleDateString("zh-CN");

      if (!dateMap[dateKey]) {
        break;
      }

      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }


  function isThisWeek(dateText) {
    const date = new Date(dateText);
    const todayDate = new Date();

    date.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    const dayOfWeek = todayDate.getDay() || 7;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() - dayOfWeek + 1);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return date >= monday && date <= sunday;
  }

  function isThisMonth(dateText) {
    const date = new Date(dateText);
    const todayDate = new Date();

    return (
      date.getFullYear() === todayDate.getFullYear() &&
      date.getMonth() === todayDate.getMonth()
    );
  }

  function getMonthDays(offset) {
    const todayDate = new Date();

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

  function getNextSevenDays() {
    const days = [];
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() + i);

      days.push({
        date: date.toLocaleDateString("zh-CN"),
        label: `${date.getMonth() + 1}/${date.getDate()}`,
      });
    }

    return days;
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
  const checkinDateText = formatInputDate(checkinDate);
  const todayRecordsByName = recordsByDate[today] || {};
  const recordsByMember = useMemo(() => {
    return getRecordsByMember(history);
  }, [history]);

  const memberStats = useMemo(() => {
    const stats = {};

    memberNames.forEach((memberName) => {
      const dateMap = recordsByMember[memberName] || {};
      const total = Object.keys(dateMap).length;
      const streak = calculateStreak(dateMap);

      stats[memberName] = {
        total,
        streak,
      };
    });

    return stats;
  }, [recordsByMember]);
  const checkedCount = Object.keys(todayRecordsByName).length;
  const totalMinutes = Object.values(todayRecordsByName).reduce(
    (sum, record) => sum + Number(record.minutes || 0),
    0
  );
  const periodStats = useMemo(() => {
    const latestByPersonAndDate = [];

    Object.values(recordsByMember).forEach((dateMap) => {
      Object.values(dateMap).forEach((record) => {
        latestByPersonAndDate.push(record);
      });
    });

    const weekRecords = latestByPersonAndDate.filter((record) =>
      isThisWeek(record.date)
    );

    const monthRecords = latestByPersonAndDate.filter((record) =>
      isThisMonth(record.date)
    );

    const weekMinutes = weekRecords.reduce(
      (sum, record) => sum + Number(record.minutes || 0),
      0
    );

    const monthMinutes = monthRecords.reduce(
      (sum, record) => sum + Number(record.minutes || 0),
      0
    );

    return {
      weekMinutes,
      monthMinutes,
      monthCheckins: monthRecords.length,
    };
  }, [recordsByMember]);
  const weeklyReport = useMemo(() => {
    const memberReports = memberNames.map((memberName) => {
      const dateMap = recordsByMember[memberName] || {};
      const weekRecords = Object.values(dateMap).filter((record) =>
        isThisWeek(record.date)
      );

      const minutes = weekRecords.reduce(
        (sum, record) => sum + Number(record.minutes || 0),
        0
      );

      return {
        memberName,
        minutes,
        checkins: weekRecords.length,
      };
    });

    const totalMinutes = memberReports.reduce(
      (sum, item) => sum + item.minutes,
      0
    );

    const totalCheckins = memberReports.reduce(
      (sum, item) => sum + item.checkins,
      0
    );

    const bestMember = [...memberReports].sort(
      (a, b) => b.minutes - a.minutes || b.checkins - a.checkins
    )[0];

    return {
      totalMinutes,
      totalCheckins,
      bestMember,
      memberReports,
    };
  }, [recordsByMember]);

  const topStreak = Math.max(
    0,
    ...memberNames.map((memberName) => memberStats[memberName]?.streak || 0)
  );

  const calendarDays = useMemo(() => getMonthDays(monthOffset), [monthOffset]);

  const calendarTitle = useMemo(() => getMonthTitle(monthOffset), [monthOffset]);

  const selectedRecordsByName = recordsByDate[selectedDate] || {};
  const selectedTotalMinutes = Object.values(selectedRecordsByName).reduce(
    (sum, record) => sum + Number(record.minutes || 0),
    0
  );
  const nextSevenDays = useMemo(() => getNextSevenDays(), []);

  const chartData = useMemo(() => {
    return memberNames.map((memberName) => {
      const dateMap = recordsByMember[memberName] || {};

      const days = nextSevenDays.map((day) => {
        const record = dateMap[day.date];

        return {
          ...day,
          minutes: Number(record?.minutes || 0),
        };
      });

      const maxMinutes = Math.max(1, ...days.map((day) => day.minutes));

      return {
        memberName,
        days,
        maxMinutes,
      };
    });
  }, [recordsByMember, nextSevenDays]);

  const syncedMembers = useMemo(() => {
    return initialMembers.map((member) => {
      const record = todayRecordsByName[member.name];
      const stats = memberStats[member.name] || { streak: 0, total: 0 };

      if (!record) {
        return {
          ...member,
          streak: stats.streak,
          total: stats.total,
        };
      }

      return {
        ...member,
        checkedToday: true,
        minutes: Number(record.minutes || 0),
        note: record.note || "",
        tasks: record.tasks ? record.tasks.split(" / ") : [],
        streak: stats.streak,
        total: stats.total,
      };
    });
  }, [todayRecordsByName, memberStats]);

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
    if (checkinDate > getDateInputValue()) {
      alert("不能提前提交未来日期的打卡");
      return;
    }
    if (!minutes || Number(minutes) <= 0) {
      alert("请输入有效的学习时长");
      return;
    }

    if (!tasks.trim()) {
      alert("请填写今天完成的任务标签");
      return;
    }

    if (!note.trim()) {
      alert("请填写今日复盘");
      return;
    }

    const taskList = tasks
      .split(/[，,]/)
      .map((t) => t.trim())
      .filter(Boolean);



    setLoading(true);

    // 先查：这个人今天是否已经打过卡
    const { data: existingRecords, error: selectError } = await supabase

      .from("checkins")

      .select("id")

      .eq("name", currentUser.name)

      .eq("date", checkinDateText)

      .order("created_at", { ascending: false })

      .limit(1);

    if (selectError) {
      setLoading(false);
      console.error("查询今日记录失败：", selectError);
      alert("查询今日记录失败，请检查 Supabase 连接");
      return;
    }

    const newRecord = {
      name: currentUser.name,
      role: currentUser.role,
      date: checkinDateText,
      minutes: parsedMinutes,
      tasks: taskList.join(" / "),
      note,
      updated_at: new Date().toISOString(),
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
      alert("提交失败，请检查 Supabase 表字段是否正确");
      return;
    }



    await fetchHistory();
    setSelectedDate(checkinDateText);
    setMinutes("");
    setTasks("");
    setNote("");
  }
  function handleStartEdit(record) {
    if (!canEditRecord(record)) {
      alert("你只能编辑自己的记录");
      return;
    }

    setEditingRecord(record);
    setEditMinutes(String(record.minutes || ""));
    setEditTasks(record.tasks || "");
    setEditNote(record.note || "");
  }
  async function handleDeleteRecord(recordId) {
    if (currentUser.role !== "admin") {
      alert("只有管理员可以删除记录");
      return;
    }

    const confirmed = window.confirm("确定要删除这条打卡记录吗？删除后不能恢复");

    if (!confirmed) return;

    const { error } = await supabase
      .from("checkins")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error("删除失败：", error);
      alert("删除失败，请检查 Supabase 设置");
      return;
    }

    await fetchHistory();
  }
  function handleCancelEdit() {
    setEditingRecord(null);
    setEditMinutes("");
    setEditTasks("");
    setEditNote("");
  }
  async function handleSaveEdit() {
    if (!editingRecord) return;

    if (!editMinutes || Number(editMinutes) <= 0) {
      alert("请输入有效的学习时长");
      return;
    }

    if (!editTasks.trim()) {
      alert("请填写任务内容");
      return;
    }

    if (!editNote.trim()) {
      alert("请填写复盘内容");
      return;
    }

    const { error } = await supabase
      .from("checkins")
      .update({
        minutes: Math.max(0, Number(editMinutes) || 0),
        tasks: editTasks.trim(),
        note: editNote.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingRecord.id);

    if (error) {
      console.error("保存编辑失败：", error);
      alert("保存失败，请检查 Supabase 设置");
      return;
    }

    handleCancelEdit();
    await fetchHistory();
  }
  function handleExportCSV() {
    if (currentUser.role !== "admin") {
      alert("只有管理员可以导出数据");
      return;
    }

    const latestRecords = [];

    Object.values(recordsByMember).forEach((dateMap) => {
      Object.values(dateMap).forEach((record) => {
        latestRecords.push(record);
      });
    });

    const sortedRecords = latestRecords.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) return dateB - dateA;

      return String(a.name).localeCompare(String(b.name), "zh-CN");
    });

    const headers = ["日期", "姓名", "身份", "学习时长", "任务", "复盘", "更新时间"];

    const rows = sortedRecords.map((record) => [
      record.date || "",
      record.name || "",
      record.role || "",
      record.minutes || 0,
      record.tasks || "",
      record.note || "",
      record.updated_at || record.created_at || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `study-circle-checkins-${new Date()
      .toLocaleDateString("zh-CN")
      .replaceAll("/", "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
  if (!currentUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p className="section-kicker">PRIVATE STUDY LOG</p>
          <h1>Study Circle</h1>
          <p>
            请输入你的专属邀请码，登录后，系统会自动识别你的身份，不能随便冒用别人的名字打卡。
          </p>

          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="输入邀请码"
          />

          {loginError && <div className="login-error">{loginError}</div>}

          <button onClick={handleLogin}>进入打卡系统</button>
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="header-label">PRIVATE STUDY LOG</p>
          <h1>Study Circle</h1>
          <p>David / 余静雯 / 陈夏娇 的小群学习打卡系统</p>
        </div>
        <div className="header-actions">
          <div className="user-badge">
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role === "admin" ? "管理员" : "成员"}</span>
          </div>

          <button onClick={() => setActiveTab("checkin")}>
            去打卡
          </button>

          {currentUser.role === "admin" && (

            <button className="ghost-button" onClick={handleExportCSV}>

              导出 CSV

            </button>

          )}
          <button className="ghost-button" onClick={handleLogout}>
            退出
          </button>
        </div>
      </header>

      <section className="hero">

        <p className="hero-label">DAILY DISCIPLINE SYSTEM</p>

        <h2>每日打卡，不要虚报时长哦～</h2>

        <p>

          用统一记录代替口头承诺，每一天的学习时长、任务内容和复盘都会被保存，方便三个人互相监督、追踪进度、复盘执行质量

        </p>

      </section>

      <section className="stats">
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
          <p>本周总时长</p>
          <h3>{periodStats.weekMinutes} 分钟</h3>
        </div>

        <div className="stat-card">
          <p>本月总时长</p>
          <h3>{periodStats.monthMinutes} 分钟</h3>
        </div>

        <div className="stat-card">
          <p>本月打卡次数</p>
          <h3>{periodStats.monthCheckins} 次</h3>
        </div>

        <div className="stat-card">
          <p>最高连续</p>
          <h3>{topStreak} 天</h3>
        </div>
      </section>
      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="main">
        {activeTab === "checkin" && (
          <section className="form-card">
            <h2>快速打卡</h2>
            <div className="current-user-card">
              当前登录：<strong>{currentUser.name}</strong>
              <span>{currentUser.role === "admin" ? "管理员" : "成员"}</span>
            </div>

            <label>
              打卡日期
              <input
                type="date"
                value={checkinDate}
                max={getDateInputValue()}
                onChange={(e) => setCheckinDate(e.target.value)}
              />
            </label>

            <label>
              学习时长 / 分钟
              <input

                value={minutes}

                onChange={(e) => setMinutes(e.target.value)}

                placeholder="例如：120"

              />
            </label>

            <label>
              任务标签，用逗号隔开
              <input
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder="例如：英语学习, 数学错题"
              />
            </label>

            <label>
              今日复盘
              <textarea

                value={note}

                onChange={(e) => setNote(e.target.value)}

                placeholder="写一下今天完成了什么、哪里需要改进"

              />
            </label>

            <button onClick={handleCheckin} disabled={loading}>

              <CheckCircle2 size={18} />

              {loading ? "提交中..." : "提交打卡"}

            </button>
          </section>
        )}

        {activeTab === "members" && (
          <section className="records">
            <div className="records-top">
              <div>
                <h2>成员打卡记录</h2>
                <p>按今日学习时长和连续天数排序</p>
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
        )}
      </main>
      {activeTab === "admin" && currentUser.role === "admin" && (
        <section className="today-admin-card">
          <div className="records-top">
            <div>
              <p className="section-kicker">TODAY CONTROL</p>
              <h2>今日记录管理</h2>
              <p>查看今天三个人的打卡状态</p>
            </div>
          </div>

          <div className="today-record-list">
            {memberNames.map((memberName) => {
              const record = todayRecordsByName[memberName];

              return (
                <div
                  className={record ? "today-record done" : "today-record"}
                  key={memberName}
                >
                  <div className="today-record-head">
                    <strong>{memberName}</strong>
                    <span>{record ? "今日已打卡" : "今日未打卡"}</span>
                  </div>

                  {record ? (
                    <>
                      <p className="today-minutes">{record.minutes} 分钟</p>
                      <p>{record.tasks}</p>
                      <p>{record.note}</p>


                      {canEditRecord(record) && (
                        <button
                          className="edit-button"
                          onClick={() => handleStartEdit(record)}
                        >
                          编辑这条记录
                        </button>
                      )}



                      {currentUser.role === "admin" && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          删除这条记录
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="selected-empty">今天还没有提交记录</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "report" && (
        <>
          <section className="chart-card">
            <div className="records-top">
              <div>
                <p className="section-kicker">LEARNING CURVE</p>
                <h2>未来 7 天打卡视图</h2>

                <p>时间轴与年度日历一致，从今天开始向后显示 7 天</p>
              </div>
            </div>

            <div className="chart-grid">
              {chartData.map((member) => (
                <div className="chart-member" key={member.memberName}>
                  <div className="chart-member-head">
                    <strong>{member.memberName}</strong>
                    <span>
                      未来 7 日合计{" "}
                      {member.days.reduce((sum, day) => sum + day.minutes, 0)} 分钟
                    </span>
                  </div>

                  <div className="bar-chart">
                    {member.days.map((day) => (
                      <div className="bar-item" key={day.date}>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${Math.max(
                                4,
                                (day.minutes / member.maxMinutes) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="bar-minutes">{day.minutes}</span>
                        <span className="bar-label">{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="weekly-report-card">
            <div className="records-top">
              <div>
                <p className="section-kicker">WEEKLY REPORT</p>
                <h2>本周学习周报</h2>
                <p>按本周一到周日统计，小组和个人数据会根据打卡记录自动更新</p>
              </div>
            </div>

            <div className="weekly-summary">
              <div>
                <span>本周总时长</span>
                <strong>{weeklyReport.totalMinutes} 分钟</strong>
              </div>

              <div>
                <span>本周打卡次数</span>
                <strong>{weeklyReport.totalCheckins} 次</strong>
              </div>

              <div>
                <span>本周最佳执行者</span>
                <strong>{weeklyReport.bestMember?.memberName || "-"}</strong>
              </div>
            </div>

            <div className="weekly-member-list">
              {weeklyReport.memberReports.map((item) => (
                <div className="weekly-member" key={item.memberName}>
                  <div>
                    <strong>{item.memberName}</strong>
                    <span>{item.checkins} 天打卡</span>
                  </div>

                  <p>{item.minutes} 分钟</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "calendar" && (
        <section className="history-card">
          <div className="history-top">
            <div>
              <p className="section-kicker">CHECK-IN CALENDAR</p>
              <h2>年度打卡日历</h2>
              <p>查看前后一年内的打卡记录，点击日期查看当天三个人的打卡情况</p>
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
                  onClick={() => setMonthOffset((prev) => Math.max(-12, prev - 1))}
                  disabled={monthOffset === -12}
                >
                  上个月
                </button>

                <strong>{calendarTitle}</strong>

                <button
                  onClick={() => setMonthOffset((prev) => Math.min(12, prev + 1))}
                  disabled={monthOffset === 12}
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

                      {canEditRecord(record) && (
                        <button
                          className="edit-button"
                          onClick={() => handleStartEdit(record)}
                        >
                          编辑这条记录
                        </button>
                      )}

                      {currentUser.role === "admin" && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          删除这条记录
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="selected-empty">这一天还没有提交记录</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {editingRecord && (
        <div className="edit-modal-backdrop">
          <div className="edit-modal">
            <p className="section-kicker">EDIT RECORD</p>
            <h2>编辑打卡记录</h2>

            <div className="edit-record-info">
              <strong>{editingRecord.name}</strong>
              <span>{editingRecord.date}</span>
            </div>

            <label>
              学习时长 / 分钟
              <input
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
              />
            </label>

            <label>
              任务内容
              <input
                value={editTasks}
                onChange={(e) => setEditTasks(e.target.value)}
              />
            </label>

            <label>
              复盘内容
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </label>

            <div className="edit-modal-actions">
              <button className="ghost-button" onClick={handleCancelEdit}>
                取消
              </button>

              <button onClick={handleSaveEdit}>
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}