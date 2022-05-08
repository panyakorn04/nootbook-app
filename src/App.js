import React, { useEffect, useMemo, useState } from "react";

const NoteList = ({ notes = [], onPickNote, onDeleteNote }) => {
  return notes.map((note, index) => (
    <div key={index} style={{ borderBottom: "1px solid #e5e5e5" }}>
      <p style={{ fontWeight: "bold", fontSize: "0.875rem" }}>{note.title}</p>
      <p style={{ fontSize: "0.75rem" }}>{(note.content || "").slice(0, 40)}</p>
      <div style={{ display: "flex", gap: "0.25rem" }}>
        <button
          onClick={() => {
            onPickNote(note);
          }}
        >
          Edit
        </button>
        <button
          onClick={() => {
            onDeleteNote(note);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ));
};
const useTimeTravel = (data) => {
  const [present, setPresent] = useState(data);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  useEffect(() => {
    if (data) {
      setPresent(data);
    }
  }, [data]);

  return {
    present,
    history,
    future,
    update: (partialData) => {
      setPresent((latestPresent) => ({ ...latestPresent, ...partialData }));
      setHistory((latestHistory) => [present, ...latestHistory]);
    },
    undo: () => {
      const previousNote = history[0];
      if (previousNote) {
        setPresent(previousNote);
        setFuture((latestFuture) => latestFuture.slice(1));
        setHistory((latestHistory) => latestHistory.slice(1));
      }
    },
    redo: () => {
      const lastNote = future[0];
      if (lastNote) {
        setPresent(lastNote);
        setHistory((latestHistory) => [present, ...latestHistory]);
        setFuture((latestFuture) => latestFuture.slice(1));
      }
    },
    reset: (initialData) => {
      setPresent(initialData);
      setHistory([]);
      setFuture([]);
    },
  };
};
const NoteEditor = ({ note, onSave }) => {
  const defaultNote = useMemo(() => ({ title: "", content: "" }), []);
  const {
    history,
    present: { title, content },
    future,
    update,
    undo,
    redo,
    reset,
  } = useTimeTravel(note || defaultNote);
  return (
    <>
      <label htmlFor="title">Title</label>
      <div>
        <input
          id="title"
          value={title}
          onChange={(event) => {
            update({ title: event.target.value });
          }}
        />
      </div>
      <br />
      <label htmlFor="content">content</label>
      <div>
        <textarea
          id="content"
          value={content}
          onChange={(event) => {
            update({ content: event.target.value });
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          disabled={!history.length}
          onClick={() => {
            undo();
          }}
        >
          Undo
        </button>
        <button
          disabled={!future.length}
          onClick={() => {
            redo();
          }}
        >
          Redo
        </button>
        <button
          disabled={!title}
          style={{ width: 80 }}
          onClick={() => {
            reset({ title: "", content: "" });
            onSave({ title, content });
          }}
        >
          Save
        </button>
      </div>
    </>
  );
};
function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  return (
    <div
      style={{ maxWidth: 400, margin: "auto", display: "flex", gap: "1rem" }}
    >
      <div
        style={{
          flexBasis: 120,
          borderRight: "1px solid #e5e5e5",
          padding: "1rem",
        }}
      >
        <NoteList
          notes={notes}
          onPickNote={(note) => {
            setSelectedNote(note);
          }}
          onDeleteNote={(note) => {
            setSelectedNote(null);
            return setNotes((latestNotes) =>
              latestNotes.filter((item) => item.id !== note.id)
            );
          }}
        />
      </div>
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Note Edit</h1>

        <NoteEditor
          note={selectedNote}
          onSave={(note) => {
            if (selectedNote) {
              setNotes((latestNotes) =>
                latestNotes.map((item) => {
                  if (item.id === selectedNote.id) {
                    return { ...item, ...note };
                  }
                  return item;
                })
              );
              setSelectedNote(null);
            } else {
              setNotes((LatestNotes) => [
                { ...note, id: Date.now() },
                ...LatestNotes,
              ]);
            }
          }}
        />
      </div>
    </div>
  );
}
export default App;


