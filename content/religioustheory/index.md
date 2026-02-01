---
layout: religioustheory.njk
title: "Religious Theory Archive"
eleventyExcludeFromCollections: true
pagination:
  data: collections.religioustheory
  size: 10
  alias: archiveItems
  reverse: true
permalink: "/religioustheory/{% if pagination.pageNumber > 0 %}{{ pagination.pageNumber + 1 }}/{% endif %}index.html"
---

<div class="archive-list">
    <ul class="list-unstyled">
    {% for item in archiveItems %}
        <li class="mb-4 pb-3 border-bottom">
            <h3 class="h4 mb-1">
                <a href="{{ item.url }}" class="text-decoration-none text-dark hover-pink">
                    {{ item.data.title or item.fileSlug or "Archive Item" }}
                </a>
            </h3>
            <small class="text-muted">
                <i class="far fa-calendar-alt me-1"></i> {{ item.date | htmlDateString }}
            </small>
        </li>
    {% endfor %}
    </ul>
</div>
<nav aria-label="Archive Page Navigation" class="mt-5 text-center">
    {% if pagination.href.previous %}<a class="btn btn-pink" href="{{ pagination.href.previous }}">Previous</a>{% endif %}
    <span class="mx-3">Page {{ pagination.pageNumber + 1 }} of {{ pagination.pages.length }}</span>
    {% if pagination.href.next %}<a class="btn btn-pink" href="{{ pagination.href.next }}">Next</a>{% endif %}
</nav>