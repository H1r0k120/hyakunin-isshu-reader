import React, { useState, useEffect, useRef } from "react";
import './App.css';


export default function HyakuninApp() {
  const [poems, setPoems] = useState([]);
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("全体");
  const [playMode, setPlayMode] = useState("random"); // "random" or "sequential"
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  // データ読み込み
  useEffect(() => {
    Promise.all([
      fetch("poems.json").then(res => res.json()),
      fetch("groupings.json").then(res => res.json())
    ]).then(([poemsData, groupingsData]) => {
      setPoems(poemsData);
      setGroups(groupingsData);
    });
  }, []);

  // 選択中のグループの番号リスト
  const selectedNumbers = groups[selectedGroup] || [];

  // 選択グループの番号と一致する和歌のみ抽出
  const filteredPoems = selectedGroup === "全体"
    ? poems
    : poems.filter(poem =>
        (groups[selectedGroup] || []).includes(Number(poem["番号"]))
      );

  // 現在表示中の和歌
  const currentPoem = playMode === "random"
    ? filteredPoems.length > 0
      ? filteredPoems[Math.floor(Math.random() * filteredPoems.length)]
      : null
    : filteredPoems.length > 0
      ? filteredPoems[currentIndex % filteredPoems.length]
      : null;

  // 次の句表示ボタンの処理
  function nextPoem() {
    if (playMode === "sequential") {
      setCurrentIndex(i => (i + 1) % filteredPoems.length);
    } else {
      // ランダムモードなら再描画のためindex更新だけ（適当な値に変える）
      setCurrentIndex(i => i + 1);
    }
  }

  // currentPoem変化で音声を再生
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [currentPoem]);

  return (
    <div className={`container theme-${selectedGroup}`}>
      <h1>百人一首ランダム再生</h1>

      <div className="controls">
        <label>
          <select value={selectedGroup} onChange={e => {
            setSelectedGroup(e.target.value);
            setCurrentIndex(0);
          }}>
            <option value="全体">全体</option>
            {Object.keys(groups).map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </label>

        <button
          onClick={() => {
            setPlayMode(playMode === "random" ? "sequential" : "random");
            setCurrentIndex(0);
          }}
        >
          {playMode === "random" ? "ランダム再生" : "連続再生"}
        </button>
      </div>

      {currentPoem ? (
        <div className="poem-card">
          <p className="poem-line">
            <ruby>{currentPoem["上の句"]}
              <rt>{currentPoem["上の句カナ"]}</rt>
            </ruby>
          </p>
          <p className="poem-line">
            <ruby>{currentPoem["下の句"]}
              <rt>{currentPoem["下の句カナ"]}</rt>
            </ruby>
          </p>
          <p className="author">作者: {currentPoem["作者"]}</p>

          <audio controls ref={audioRef} className="audio-player">
            <source src={`file/${String(currentPoem["番号"]).padStart(3, '0')}.mp3`} type="audio/mp3" />
            お使いのブラウザは audio 要素をサポートしていません。
          </audio>

          <button onClick={nextPoem} className="next-button">
            次の句
          </button>
        </div>
      ) : (
        <p style={{ marginTop: 40 }}>読み込んだ和歌がありません。</p>
      )}
    </div>
  );
}
