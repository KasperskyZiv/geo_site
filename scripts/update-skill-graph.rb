#!/usr/bin/env ruby
# frozen_string_literal: true
# encoding: utf-8
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

require "cgi"
require "json"
require "set"
require "time"
require "yaml"

script_dir = File.expand_path(__dir__)
skills_root = File.expand_path("../.claude/skills", script_dir)
output_path = File.join(skills_root, "skill-graph.html")

def h(value)
  CGI.escapeHTML(value.to_s)
end

def truncate(value, max)
  text = value.to_s
  text.length > max ? "#{text[0, max - 1]}…" : text
end

skill_files = Dir.glob(File.join(skills_root, "*/SKILL.md")).sort

skills = skill_files.map do |path|
  text = File.read(path, encoding: "UTF-8")
  frontmatter = text.match(/\A---\n(.*?)\n---\n/m)
  abort "Missing frontmatter: #{path}" unless frontmatter

  meta = YAML.safe_load(frontmatter[1])
  name = meta.fetch("name")
  folder = File.basename(File.dirname(path))
  abort "Name mismatch: #{path} has #{name}, folder is #{folder}" unless name == folder

  body = text.sub(/\A---\n.*?\n---\n/m, "")
  description = meta.fetch("description").to_s.strip.gsub(/\s+/, " ")
  parts = name.split(".")
  namespace = parts.first || "local"
  service = namespace == "external" ? (parts[1] || "external") : namespace

  {
    name: name,
    namespace: namespace,
    service: service,
    path: path.sub("#{skills_root}/", ""),
    title: body[/^#\s+(.+)$/, 1] || name,
    description: description,
    disable_model_invocation: meta["disable-model-invocation"] == true,
    user_invocable: meta.fetch("user-invocable", true) != false,
    line_count: text.lines.count,
    body: body
  }
end

names = skills.map { |skill| skill[:name] }
name_set = names.to_set
# Namespace prefixes actually present in this skill library — used to detect dangling
# cross-skill references. Derived from the live skill names only: a hardcoded extra
# prefix outlives the skills it was added for and then silently SUPPRESSES the very
# dangling-reference warning this list exists to raise (an "langchain" entry did
# exactly that after those skills were deleted).
known_namespace_prefixes = names.map { |n| n.split(".").first }.uniq.map { |ns| Regexp.escape(ns) }
edges = []
unresolved = []

skills.each do |skill|
  haystack = "#{skill[:description]}\n#{skill[:body]}"

  names.each do |target|
    next if target == skill[:name]
    next unless haystack.include?(target)

    relation =
      if haystack.match?(/use #{Regexp.escape(target)}|use `#{Regexp.escape(target)}`/)
        "redirect"
      elsif haystack.match?(/combine .*#{Regexp.escape(target)}|activate `?#{Regexp.escape(target)}`?/)
        "combine"
      else
        "reference"
      end

    edges << { source: skill[:name], target: target, relation: relation }
  end

  haystack.scan(/\b(?:#{known_namespace_prefixes.join('|')})\.[a-z0-9.-]+\b/) do |candidate|
    unresolved << { source: skill[:name], target: candidate } unless name_set.include?(candidate)
  end
end

edges.uniq!
unresolved.uniq!
connected = edges.flat_map { |edge| [edge[:source], edge[:target]] }.to_set
orphans = names.reject { |name| connected.include?(name) }
too_long = skills.select { |skill| skill[:line_count] > 250 }.map { |skill| skill[:name] }

namespace_order = %w[external shared local]
namespaces = skills.map { |skill| skill[:namespace] }.uniq
ordered_namespaces = (namespace_order & namespaces) + (namespaces - namespace_order).sort
colors = {
  "external" => "#c7602b",
  "shared" => "#4cb7e8",
  "local" => "#778494"
}

node_w = 252
node_h = 60
row_gap = 36
col_gap = 44
top = 116
positions = {}
band_labels = []

left = 70
band_gap = 70
ordered_namespaces.each do |namespace|
  group = skills.select { |skill| skill[:namespace] == namespace }.sort_by { |skill| skill[:name] }
  cols = group.length > 6 ? 2 : 1
  rows = (group.length.to_f / cols).ceil
  band_w = cols * node_w + (cols - 1) * col_gap
  band_labels << { namespace: namespace, x: left, y: 62, count: group.length, width: band_w }

  group.each_with_index do |skill, index|
    col = index / rows
    row = index % rows
    x = left + col * (node_w + col_gap)
    y = top + row * (node_h + row_gap)
    positions[skill[:name]] = {
      x: x,
      y: y,
      cx: x + node_w / 2.0,
      cy: y + node_h / 2.0
    }
  end

  left += band_w + band_gap
end

view_w = [(positions.values.map { |p| p[:x] + node_w }.max || 1180) + 56, 1180].max
max_y = positions.values.map { |p| p[:y] + node_h }.max || 640
view_h = [max_y + 56, 700].max

skill_payload = skills
graph = {
  generated_at: Time.now.iso8601,
  skills: skill_payload,
  edges: edges,
  health: {
    unresolved: unresolved,
    orphans: orphans,
    too_long: too_long,
    missing_namespace: skills.reject { |skill| skill[:name].include?(".") }.map { |skill| skill[:name] }
  }
}

hw = node_w / 2.0

# Pass 1 - geometry. Every edge enters/exits a LEFT or RIGHT face (never top/bottom);
# endpoints sit on the box edge so the arrowhead touches the frame. `ch` is the x of
# the vertical channel the edge routes through. Same-column pairs loop out the right
# face through the inter-column gap.
edge_geo = edges.map do |edge|
  source = positions.fetch(edge[:source])
  target = positions.fetch(edge[:target])
  sx = source[:cx]
  sy = source[:cy]
  tx = target[:cx]
  ty = target[:cy]
  dx = tx - sx

  if dx >= node_w
    x0 = sx + hw
    x1 = tx - hw
    ch = (x0 + x1) / 2.0
  elsif dx <= -node_w
    x0 = sx - hw
    x1 = tx + hw
    ch = (x0 + x1) / 2.0
  else
    x0 = sx + hw
    x1 = tx + hw
    ch = [x0, x1].max + col_gap / 2.0
  end

  { edge: edge, x0: x0, x1: x1, sy: sy, ty: ty, ch: ch }
end

# Same-channel edges stay coincident here (same-color lines stack on selection). On
# selection, incoming vs outgoing edges are nudged left/right by a tiny CSS translate
# so different-colored lines separate just enough to touch.
edge_markup = edge_geo.map do |g|
  edge = g[:edge]
  chx = g[:ch].round(1)
  path = "M #{g[:x0].round(1)} #{g[:sy].round(1)} L #{chx} #{g[:sy].round(1)} L #{chx} #{g[:ty].round(1)} L #{g[:x1].round(1)} #{g[:ty].round(1)}"
  %(<path class="edge #{h(edge[:relation])}" data-source="#{h(edge[:source])}" data-target="#{h(edge[:target])}" data-relation="#{h(edge[:relation])}" d="#{path}"></path>)
end.join("\n")

label_markup = band_labels.map do |label|
  color = colors.fetch(label[:namespace], colors["local"])
  %(<g class="band-label" transform="translate(#{label[:x]}, #{label[:y]})">
      <rect width="#{label[:width]}" height="34" rx="10"></rect>
      <circle cx="16" cy="17" r="5" fill="#{color}"></circle>
      <text x="29" y="21">#{h(label[:namespace])} · #{label[:count]}</text>
    </g>)
end.join("\n")

node_markup = skills.sort_by { |skill| [ordered_namespaces.index(skill[:namespace]) || 99, skill[:name]] }.map do |skill|
  p = positions.fetch(skill[:name])
  color = colors.fetch(skill[:namespace], colors["local"])
  outgoing = edges.count { |edge| edge[:source] == skill[:name] }
  incoming = edges.count { |edge| edge[:target] == skill[:name] }
  %(<g class="node" data-name="#{h(skill[:name])}" data-namespace="#{h(skill[:namespace])}" transform="translate(#{p[:x]}, #{p[:y]})">
      <rect class="node-card" width="#{node_w}" height="#{node_h}" rx="12"></rect>
      <rect class="node-accent" x="0" y="11" width="6" height="#{node_h - 22}" rx="3" fill="#{color}"></rect>
      <text class="node-name" x="18" y="23">#{h(truncate(skill[:name], 33))}</text>
      <text class="node-meta" x="18" y="42">#{h(skill[:service])} · #{skill[:line_count]} lines</text>
      <text class="node-degree" x="#{node_w - 58}" y="42">#{incoming} in / #{outgoing} out</text>
    </g>)
end.join("\n")

json = JSON.pretty_generate(graph).gsub("</", "<\\/")
issue_count = unresolved.length + orphans.length + too_long.length + graph[:health][:missing_namespace].length

html = <<~HTML
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Skill Graph</title>
    <style>
      :root {
        --bg: #edf2f7;
        --surface: #ffffff;
        --panel: rgba(255,255,255,.94);
        --ink: #172033;
        --muted: #65748a;
        --line: #d6dee9;
        --line-strong: #b9c6d5;
        --external: #c7602b;
        --shared: #4cb7e8;
        --local: #778494;
        --shadow: 0 18px 50px rgba(23, 32, 51, .14);
      }

      * { box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .app {
        height: 100vh;
        display: grid;
        grid-template-rows: 64px 1fr;
      }

      header {
        display: grid;
        grid-template-columns: minmax(250px, 1fr) auto;
        align-items: center;
        gap: 18px;
        padding: 10px 18px;
        background: var(--surface);
        border-bottom: 1px solid var(--line);
        z-index: 3;
      }

      h1 {
        margin: 0;
        font-size: 20px;
        letter-spacing: 0;
        line-height: 1.15;
      }

      .subtitle, .generated {
        color: var(--muted);
        font-size: 12px;
        line-height: 1.25;
      }

      .generated { text-align: right; }

      .workspace {
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 6px var(--aside-w, 390px);
      }

      .resizer {
        cursor: col-resize;
        background: var(--line);
        z-index: 4;
        transition: background .15s;
      }
      .resizer:hover, .resizer.dragging { background: var(--line-strong); }
      body.resizing { cursor: col-resize; user-select: none; }

      .graph-pane {
        position: relative;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        background:
          radial-gradient(circle at 20% 10%, rgba(20,112,175,.08), transparent 28%),
          linear-gradient(var(--line) 1px, transparent 1px),
          linear-gradient(90deg, var(--line) 1px, transparent 1px);
        background-size: auto, 36px 36px, 36px 36px;
        background-color: #f9fbfe;
      }

      .topbar {
        position: absolute;
        top: 14px;
        left: 14px;
        right: 14px;
        z-index: 2;
        display: grid;
        grid-template-columns: minmax(260px, 460px) 1fr auto;
        gap: 10px;
        align-items: start;
        pointer-events: none;
      }

      .topbar > * { pointer-events: auto; }

      .search {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding: 8px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--panel);
        box-shadow: var(--shadow);
      }

      input {
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        font: inherit;
        color: var(--ink);
        padding: 6px 8px;
      }

      button {
        border: 1px solid var(--line-strong);
        border-radius: 9px;
        background: #fff;
        color: var(--ink);
        padding: 7px 10px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .filters, .mode {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .filters button, .mode button {
        background: var(--panel);
        box-shadow: 0 6px 20px rgba(23,32,51,.08);
      }

      .filters button.off {
        opacity: .35;
      }

      .stats-strip {
        position: absolute;
        left: 14px;
        bottom: 14px;
        z-index: 2;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .stat {
        min-width: 92px;
        padding: 9px 11px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--panel);
        box-shadow: 0 8px 26px rgba(23,32,51,.08);
      }

      .stat strong { display: block; font-size: 18px; line-height: 1; }
      .stat span { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }

      .graph-scroll {
        position: absolute;
        inset: 0;
        overflow: auto;
        z-index: 1;
      }
      #graph {
        display: block;
      }

      .band-label rect {
        fill: rgba(255,255,255,.92);
        stroke: var(--line);
      }

      .band-label text {
        fill: var(--muted);
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
      }

      .edge {
        fill: none;
        stroke: #94a5b8;
        stroke-width: 1.35;
        opacity: .38;
        marker-end: url(#arrow);
      }

      .edge.redirect { stroke-width: 2.15; opacity: .58; }
      .edge.combine { stroke-dasharray: 8 6; }
      .edge.hidden, .node.hidden { display: none; }
      .edge.dim { opacity: .08; }
      .edge.focus { stroke: #1b2a3b; stroke-width: 2.8; opacity: .95; }
      .edge.incoming { stroke: #f0746a; stroke-width: 2.6; opacity: .98; marker-end: url(#arrow-in); transform: translateX(-1.5px); }
      .edge.outgoing { stroke: #36c06e; stroke-width: 2.6; opacity: .98; marker-end: url(#arrow-out); transform: translateX(1.5px); }

      .node { cursor: pointer; }
      .node.dim { opacity: .18; }
      .node-card {
        fill: rgba(255,255,255,.97);
        stroke: var(--line-strong);
        stroke-width: 2;
        filter: drop-shadow(0 10px 18px rgba(23,32,51,.13));
      }
      .node.selected .node-card {
        stroke: #172033;
        stroke-width: 3.2;
      }
      .node.nbr-in .node-card  { stroke: #f0746a; stroke-width: 3.2; fill: #fcebe9; }
      .node.nbr-out .node-card { stroke: #36c06e; stroke-width: 3.2; fill: #ecf9f1; }
      .node.nbr-both .node-card { stroke: #64748b; stroke-width: 3.2; fill: #eef1f5; }
      .legend-row { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--ink); margin-bottom: 7px; }
      .legend-row:last-of-type { margin-bottom: 0; }
      .legend .swatch { width: 18px; height: 9px; border-radius: 3px; flex: none; }
      .legend .swatch.in { background: #f0746a; }
      .legend .swatch.out { background: #36c06e; }
      .legend .swatch.both { background: #64748b; }
      .legend-note { margin-top: 9px; font-size: 11px; color: var(--muted); line-height: 1.4; }
      .node-name { fill: var(--ink); font-size: 11px; font-weight: 850; }
      .node-meta, .node-degree { fill: var(--muted); font-size: 10.5px; font-weight: 650; }

      aside {
        min-height: 0;
        overflow: auto;
        padding: 14px;
        background: var(--surface);
        border-left: 1px solid var(--line);
      }

      .panel {
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 12px;
        background: #fff;
      }

      .panel h2 {
        margin: 0;
        padding: 11px 13px;
        border-bottom: 1px solid var(--line);
        background: #f8fafc;
        font-size: 13px;
      }

      .panel-body {
        padding: 12px 13px;
      }

      .detail h3 {
        margin: 0 0 8px;
        font-size: 17px;
        overflow-wrap: anywhere;
      }

      .detail p, .row small {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.45;
      }

      .path {
        margin-bottom: 10px;
        color: var(--muted);
        font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        overflow-wrap: anywhere;
      }

      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 10px 0;
      }

      .desc-sec { margin: 9px 0; }
      .desc-label {
        display: block;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .04em;
        color: var(--muted);
        margin-bottom: 2px;
      }
      .desc-text { font-size: 12.5px; line-height: 1.5; color: var(--ink); overflow-wrap: anywhere; }
      .desc-summary { font-size: 13px; line-height: 1.5; color: var(--ink); margin: 4px 0 10px; }
      .chips { display: flex; flex-wrap: wrap; gap: 5px; }
      .chip-sm {
        font-size: 11px;
        padding: 3px 7px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: #f8fafc;
        color: var(--ink);
      }
      .full-skill { margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
      .full-skill > summary {
        cursor: pointer;
        padding: 9px 12px;
        font-size: 12px;
        font-weight: 700;
        background: #f8fafc;
        list-style: none;
        user-select: none;
      }
      .full-skill > summary::-webkit-details-marker { display: none; }
      .full-skill > summary::before { content: "▸ "; color: var(--muted); }
      .full-skill[open] > summary::before { content: "▾ "; }
      .skill-body {
        padding: 2px 13px 12px;
        border-top: 1px solid var(--line);
        font-size: 12.5px;
        line-height: 1.5;
        color: var(--ink);
        background: #fff;
        overflow-wrap: anywhere;
      }
      .skill-body .md-h { font-size: 12.5px; font-weight: 800; margin: 13px 0 4px; }
      .skill-body h1.md-h { font-size: 15px; margin-top: 10px; }
      .skill-body h2.md-h { font-size: 13px; }
      .skill-body .md-p { margin: 7px 0; }
      .skill-body .md-ul, .skill-body .md-ol { margin: 6px 0; padding-left: 19px; }
      .skill-body li { margin: 3px 0; }
      .skill-body .md-q { margin: 9px 0; padding: 6px 11px; border-left: 3px solid var(--line-strong); background: #f8fafc; color: var(--muted); border-radius: 0 6px 6px 0; }
      .skill-body .md-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; background: #eef2f7; padding: 1px 4px; border-radius: 4px; }
      .skill-body .md-pre { background: #f8fafc; border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; overflow-x: auto; }
      .skill-body .md-pre code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; white-space: pre; }
      .skill-body .md-a { color: #1470af; text-decoration: none; }
      .skill-body .md-a:hover { text-decoration: underline; }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 7px;
        border: 1px solid var(--line);
        border-radius: 999px;
        color: var(--muted);
        font-size: 11px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
      }

      .list {
        display: grid;
        gap: 7px;
      }

      .row {
        display: grid;
        gap: 4px;
        padding: 8px;
        border: 1px solid var(--line);
        border-radius: 9px;
        background: #fff;
      }

      .row button {
        all: unset;
        cursor: pointer;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .ok { color: #237b4b; }
      .warn { color: #9a4f17; }

      @media (max-width: 1080px) {
        html, body { overflow: auto; }
        .app { min-height: 100vh; height: auto; }
        .workspace { grid-template-columns: 1fr; }
        .graph-pane { height: calc(100vh - 64px); min-height: 620px; }
        aside { border-left: 0; border-top: 1px solid var(--line); max-height: none; }
      }

      @media (max-width: 720px) {
        html, body { overflow: hidden; }
        .app { height: 100vh; grid-template-rows: 58px 1fr; }
        header {
          grid-template-columns: 1fr;
          gap: 2px;
          padding: 7px 14px;
        }
        h1 { font-size: 18px; }
        .subtitle {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 11px;
        }
        .generated { display: none; }
        .workspace {
          min-height: 0;
          grid-template-columns: 1fr;
          grid-template-rows: minmax(0, 1fr) 260px;
        }
        .graph-pane {
          min-height: 0;
        }
        .topbar {
          grid-template-columns: 1fr auto;
          align-items: start;
        }
        .filters {
          grid-column: 1 / -1;
          justify-content: flex-start;
        }
        .band-label { display: none; }
        .mode { justify-content: flex-end; }
        .stats-strip { display: none; }
        aside {
          min-height: 0;
          max-height: none;
          border-left: 0;
          border-top: 1px solid var(--line);
        }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <header>
        <div>
          <h1>Skill Graph</h1>
          <div class="subtitle">Search, verify, and inspect the skill graph. Nodes are generated statically; controls enhance the view.</div>
        </div>
        <div class="generated">Generated #{h(graph[:generated_at])}<br>#{skills.length} skills · #{edges.length} edges · #{issue_count} issues</div>
      </header>
      <main class="workspace">
        <section class="graph-pane">
          <div class="topbar">
            <div class="search">
              <input id="search" type="search" placeholder="Search skills, triggers, edges">
              <button id="clearSearch" type="button">Clear</button>
            </div>
            <div class="filters" id="filters"></div>
            <div class="mode">
              <button id="fitAll" type="button">Reset view</button>
            </div>
          </div>
          <div class="stats-strip" id="stats"></div>
          <div class="graph-scroll">
          <svg id="graph" width="#{view_w.round}" height="#{view_h.round}" viewBox="0 0 #{view_w.round} #{view_h.round}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Skill graph">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#172033"></path>
              </marker>
              <marker id="arrow-in" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f0746a"></path>
              </marker>
              <marker id="arrow-out" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#36c06e"></path>
              </marker>
            </defs>
            <g class="edges">#{edge_markup}</g>
            <g class="nodes">#{node_markup}</g>
            #{label_markup}
          </svg>
          </div>
        </section>
        <div class="resizer" id="resizer" title="Drag to resize"></div>
        <aside>
          <section class="panel">
            <h2>Selected Skill</h2>
            <div class="panel-body detail" id="detail"></div>
          </section>
          <section class="panel">
            <h2>Legend</h2>
            <div class="panel-body legend">
              <div class="legend-row"><span class="swatch in"></span> Incoming &mdash; skills that link <em>to</em> the selected one</div>
              <div class="legend-row"><span class="swatch out"></span> Outgoing &mdash; skills the selected one links <em>to</em></div>
              <div class="legend-row"><span class="swatch both"></span> Both directions</div>
              <div class="legend-note">Select a skill to highlight its connections. Lines and arrowheads are colored by direction; clearing the selection resets them.</div>
            </div>
          </section>
          <section class="panel">
            <h2>Graph Health</h2>
            <div class="panel-body list" id="health"></div>
          </section>
          <section class="panel">
            <h2>Visible Skills</h2>
            <div class="panel-body list" id="skillList"></div>
          </section>
        </aside>
      </main>
    </div>
    <script type="application/json" id="skill-data">#{json}</script>
    <script>
      const data = JSON.parse(document.getElementById("skill-data").textContent);
      const colors = { external: "#c7602b", shared: "#4cb7e8", local: "#778494" };
      const nodes = data.skills.map(skill => ({
        ...skill,
        in: data.edges.filter(edge => edge.target === skill.name),
        out: data.edges.filter(edge => edge.source === skill.name)
      }));
      const byName = Object.fromEntries(nodes.map(node => [node.name, node]));
      const namespaces = [...new Set(nodes.map(node => node.namespace))].sort();
      let activeNamespaces = new Set(namespaces);
      let selected = null;
      let query = "";

      const search = document.getElementById("search");
      const clearSearch = document.getElementById("clearSearch");
      const filters = document.getElementById("filters");
      const stats = document.getElementById("stats");
      const detail = document.getElementById("detail");
      const health = document.getElementById("health");
      const skillList = document.getElementById("skillList");
      const fitAll = document.getElementById("fitAll");

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      }

      function visible(node) {
        if (!activeNamespaces.has(node.namespace)) return false;
        if (!query) return true;
        const text = `${node.name} ${node.title} ${node.path} ${node.description} ${node.in.map(e => e.source).join(" ")} ${node.out.map(e => e.target).join(" ")}`.toLowerCase();
        return text.includes(query);
      }

      function visibleNames() {
        return new Set(nodes.filter(visible).map(node => node.name));
      }

      function selectSkill(name) {
        selected = (selected && selected.name === name) ? null : (byName[name] || selected);
        render();
      }

      function renderFilters() {
        filters.innerHTML = namespaces.map(ns => {
          const active = activeNamespaces.has(ns);
          return `<button type="button" class="${active ? "" : "off"}" data-ns="${ns}" style="color:${colors[ns] || colors.local}"><span class="dot"></span>${ns}</button>`;
        }).join("");
        filters.querySelectorAll("button").forEach(button => {
          button.addEventListener("click", () => {
            const ns = button.dataset.ns;
            if (activeNamespaces.has(ns) && activeNamespaces.size > 1) activeNamespaces.delete(ns);
            else activeNamespaces.add(ns);
            render();
          });
        });
      }

      function renderGraphState() {
        const visibleSet = visibleNames();
        const inNames = new Set(selected ? selected.in.map(e => e.source) : []);
        const outNames = new Set(selected ? selected.out.map(e => e.target) : []);
        const activeSet = new Set(selected ? [selected.name, ...inNames, ...outNames] : []);

        document.querySelectorAll(".node").forEach(nodeEl => {
          const name = nodeEl.dataset.name;
          const isSel = selected && selected.name === name;
          const isIn = inNames.has(name);
          const isOut = outNames.has(name);
          nodeEl.classList.toggle("hidden", !visibleSet.has(name));
          nodeEl.classList.toggle("selected", isSel);
          nodeEl.classList.toggle("nbr-in", !isSel && isIn && !isOut);
          nodeEl.classList.toggle("nbr-out", !isSel && isOut && !isIn);
          nodeEl.classList.toggle("nbr-both", !isSel && isIn && isOut);
          nodeEl.classList.toggle("dim", selected && visibleSet.has(name) && !activeSet.has(name));
        });

        document.querySelectorAll(".edge").forEach(edgeEl => {
          const source = edgeEl.dataset.source;
          const target = edgeEl.dataset.target;
          const visibleEdge = visibleSet.has(source) && visibleSet.has(target);
          const isOut = selected && source === selected.name;
          const isIn = selected && target === selected.name;
          edgeEl.classList.toggle("hidden", !visibleEdge);
          edgeEl.classList.toggle("outgoing", visibleEdge && isOut);
          edgeEl.classList.toggle("incoming", visibleEdge && isIn);
          edgeEl.classList.toggle("dim", visibleEdge && selected && !isOut && !isIn);
        });
      }

      function renderStats() {
        const list = nodes.filter(visible);
        const set = new Set(list.map(node => node.name));
        const edgeCount = data.edges.filter(edge => set.has(edge.source) && set.has(edge.target)).length;
        const issues = data.health.unresolved.length + data.health.orphans.length + data.health.too_long.length + data.health.missing_namespace.length;
        stats.innerHTML = `
          <div class="stat"><strong>${list.length}</strong><span>visible</span></div>
          <div class="stat"><strong>${data.skills.length}</strong><span>skills</span></div>
          <div class="stat"><strong>${edgeCount}</strong><span>edges</span></div>
          <div class="stat"><strong>${issues}</strong><span>issues</span></div>
        `;
      }

      function edgeRows(title, edges, key) {
        if (!edges.length) return `<div class="row"><strong>${title}</strong><small>None</small></div>`;
        return `<div class="row"><strong>${title}</strong>${edges.map(edge => `<small>${edge.relation}: <button data-select="${edge[key]}">${edge[key]}</button></small>`).join("")}</div>`;
      }

      function renderDetail() {
        if (!selected) {
          detail.innerHTML = `
            <h3>Graph Overview</h3>
            <p>${data.skills.length} skills are present across ${namespaces.length} namespaces. Use search, namespace filters, or select a node to inspect inbound and outbound links.</p>
            <div class="badges">
              ${namespaces.map(ns => `<span class="badge" style="color:${colors[ns] || colors.local}"><span class="dot"></span>${ns}</span>`).join("")}
            </div>
          `;
          return;
        }
        detail.innerHTML = `
          <h3>${escapeHtml(selected.name)}</h3>
          <div class="path">${escapeHtml(selected.path)}</div>
          ${descSections(selected.description)}
          <div class="badges">
            <span class="badge" style="color:${colors[selected.namespace] || colors.local}"><span class="dot"></span>${selected.namespace}</span>
            <span class="badge">${selected.disable_model_invocation ? "manual" : "model-invocable"}</span>
            <span class="badge">${selected.user_invocable ? "user" : "background"}</span>
            <span class="badge">${selected.line_count} lines</span>
          </div>
          <div class="list">${edgeRows("Outgoing", selected.out, "target")}${edgeRows("Incoming", selected.in, "source")}</div>
          ${fullSkillBlock(selected.body)}
        `;
        detail.querySelectorAll("[data-select]").forEach(button => button.addEventListener("click", () => selectSkill(button.dataset.select)));
      }

      function parseDescription(desc) {
        const text = String(desc || "").trim();
        let scope = "", rest = text;
        if (text.slice(0, 7) === "[Scope:") {
          const close = text.indexOf("]");
          if (close > -1) { scope = text.slice(7, close).trim(); rest = text.slice(close + 1).trim(); }
        }
        const iUse = rest.indexOf("Use for:");
        const iNot = rest.indexOf("Not for:");
        const iAct = rest.indexOf("Activate:");
        const firstOf = (arr) => { const xs = arr.filter(i => i > -1); return xs.length ? Math.min.apply(null, xs) : rest.length; };
        const summary = rest.slice(0, firstOf([iUse, iNot, iAct])).trim();
        const useFor = iUse > -1 ? rest.slice(iUse + 8, iNot > iUse ? iNot : (iAct > iUse ? iAct : rest.length)).trim() : "";
        const notFor = iNot > -1 ? rest.slice(iNot + 8, iAct > iNot ? iAct : rest.length).trim() : "";
        const actRaw = iAct > -1 ? rest.slice(iAct + 9) : "";
        const activate = (actRaw.match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1));
        return { scope, summary, useFor, notFor, activate };
      }

      function descSections(desc) {
        const d = parseDescription(desc);
        const sec = (label, txt) => txt ? `<div class="desc-sec"><span class="desc-label">${label}</span><span class="desc-text">${escapeHtml(txt)}</span></div>` : "";
        const chips = d.activate.length
          ? `<div class="desc-sec"><span class="desc-label">Activate</span><div class="chips">${d.activate.map(a => `<span class="chip-sm">${escapeHtml(a)}</span>`).join("")}</div></div>`
          : "";
        return (d.summary ? `<p class="desc-summary">${escapeHtml(d.summary)}</p>` : "")
          + sec("Scope", d.scope) + sec("Use for", d.useFor) + sec("Not for", d.notFor) + chips;
      }

      function fullSkillBlock(body) {
        return body
          ? `<details class="full-skill"><summary>Full skill text</summary><div class="skill-body">${renderMarkdown(body)}</div></details>`
          : "";
      }

      function linkify(s) {
        let out = "", i = 0;
        while (i < s.length) {
          const open = s.indexOf("[", i);
          if (open < 0) { out += s.slice(i); break; }
          const close = s.indexOf("](", open);
          const end = close > -1 ? s.indexOf(")", close + 2) : -1;
          if (close < 0 || end < 0) { out += s.slice(i, open + 1); i = open + 1; continue; }
          out += s.slice(i, open) + '<a class="md-a" href="' + s.slice(close + 2, end) + '" target="_blank" rel="noopener">' + s.slice(open + 1, close) + '</a>';
          i = end + 1;
        }
        return out;
      }

      function mdInline(t) {
        let s = escapeHtml(t);
        s = s.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');
        s = s.replace(/[*][*]([^*]+)[*][*]/g, '<strong>$1</strong>');
        return linkify(s);
      }

      function renderMarkdown(md) {
        const NL = String.fromCharCode(10);
        const lines = String(md || "").split(NL);
        const out = [];
        let i = 0, list = null;
        const closeList = () => { if (list) { out.push("</" + list + ">"); list = null; } };
        while (i < lines.length) {
          const t = lines[i].trim();
          if (t.indexOf("```") === 0) {
            closeList();
            const buf = []; i++;
            while (i < lines.length && lines[i].trim().indexOf("```") !== 0) { buf.push(escapeHtml(lines[i])); i++; }
            i++;
            out.push('<pre class="md-pre"><code>' + buf.join(NL) + "</code></pre>");
            continue;
          }
          if (t === "") { closeList(); i++; continue; }
          if (t[0] === "#") {
            closeList();
            let lvl = 0; while (lvl < t.length && t[lvl] === "#") lvl++;
            const n = Math.min(lvl, 6);
            out.push("<h" + n + ' class="md-h">' + mdInline(t.slice(lvl).trim()) + "</h" + n + ">");
            i++; continue;
          }
          if (t[0] === ">") {
            closeList();
            const buf = [];
            while (i < lines.length && lines[i].trim()[0] === ">") { buf.push(mdInline(lines[i].trim().slice(1).trim())); i++; }
            out.push('<blockquote class="md-q">' + buf.join("<br>") + "</blockquote>");
            continue;
          }
          if (t.indexOf("- ") === 0 || t.indexOf("* ") === 0) {
            if (list !== "ul") { closeList(); out.push('<ul class="md-ul">'); list = "ul"; }
            out.push("<li>" + mdInline(t.slice(2)) + "</li>"); i++; continue;
          }
          const dot = t.indexOf(". ");
          if (dot > 0 && /^[0-9]+$/.test(t.slice(0, dot))) {
            if (list !== "ol") { closeList(); out.push('<ol class="md-ol">'); list = "ol"; }
            out.push("<li>" + mdInline(t.slice(dot + 2)) + "</li>"); i++; continue;
          }
          closeList();
          out.push('<p class="md-p">' + mdInline(t) + "</p>"); i++;
        }
        closeList();
        return out.join("");
      }

      function renderHealth() {
        const rows = [
          [data.health.unresolved.length === 0, data.health.unresolved.length === 0 ? "No unresolved skill references" : `${data.health.unresolved.length} unresolved references`],
          [data.health.orphans.length === 0, data.health.orphans.length === 0 ? "No isolated skills" : `Isolated: ${data.health.orphans.join(", ")}`],
          [data.health.too_long.length === 0, data.health.too_long.length === 0 ? "All active skills are under 250 lines" : `Too long: ${data.health.too_long.join(", ")}`],
          [data.health.missing_namespace.length === 0, data.health.missing_namespace.length === 0 ? "All skills are namespaced" : `Missing namespace: ${data.health.missing_namespace.join(", ")}`]
        ];
        health.innerHTML = rows.map(([ok, text]) => `<div class="row"><strong class="${ok ? "ok" : "warn"}">${ok ? "OK" : "Check"}</strong><small>${escapeHtml(text)}</small></div>`).join("");
      }

      function renderSkillList() {
        const list = nodes.filter(visible).sort((a, b) => a.name.localeCompare(b.name));
        skillList.innerHTML = list.map(node => `
          <div class="row">
            <button data-select="${node.name}">${escapeHtml(node.name)}</button>
            <small>${escapeHtml(node.title)} · ${node.in.length} in / ${node.out.length} out</small>
          </div>
        `).join("");
        skillList.querySelectorAll("[data-select]").forEach(button => button.addEventListener("click", () => selectSkill(button.dataset.select)));
      }

      function render() {
        renderFilters();
        renderGraphState();
        renderStats();
        renderDetail();
        renderHealth();
        renderSkillList();
      }

      document.querySelectorAll(".node").forEach(node => node.addEventListener("click", () => selectSkill(node.dataset.name)));
      search.addEventListener("input", () => {
        query = search.value.trim().toLowerCase();
        render();
      });
      clearSearch.addEventListener("click", () => {
        search.value = "";
        query = "";
        activeNamespaces = new Set(namespaces);
        render();
      });
      fitAll.addEventListener("click", () => {
        search.value = "";
        query = "";
        activeNamespaces = new Set(namespaces);
        selected = null;
        render();
      });

      (function () {
        const resizer = document.getElementById("resizer");
        const workspace = document.querySelector(".workspace");
        if (!resizer || !workspace) return;
        let dragging = false;
        const apply = (px) => {
          const max = Math.round(window.innerWidth * 0.9);
          const w = Math.max(300, Math.min(max, px));
          workspace.style.setProperty("--aside-w", w + "px");
        };
        resizer.addEventListener("mousedown", (e) => {
          dragging = true;
          resizer.classList.add("dragging");
          document.body.classList.add("resizing");
          e.preventDefault();
        });
        window.addEventListener("mousemove", (e) => {
          if (dragging) apply(window.innerWidth - e.clientX);
        });
        window.addEventListener("mouseup", () => {
          dragging = false;
          resizer.classList.remove("dragging");
          document.body.classList.remove("resizing");
        });
        resizer.addEventListener("dblclick", () => workspace.style.removeProperty("--aside-w"));
      })();

      render();
    </script>
  </body>
  </html>
HTML

File.write(output_path, html)
puts "Wrote #{output_path}"
