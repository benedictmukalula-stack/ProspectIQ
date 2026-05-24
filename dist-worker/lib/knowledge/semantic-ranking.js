export function rankSemanticEntities(entities) {
    return [...entities].sort((a, b) => Number(b.semanticScore || 0) -
        Number(a.semanticScore || 0));
}
export function generateKnowledgePriority(entities) {
    const ranked = rankSemanticEntities(entities);
    return ranked.slice(0, 10).map((entity, index) => ({
        rank: index + 1,
        id: entity.id,
        label: entity.label,
        type: entity.type,
        semanticScore: entity.semanticScore,
    }));
}
