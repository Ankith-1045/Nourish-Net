/**
 * Intelligent Food Allocation / Recommendation Module
 * Calculates recommendation score (0-100) and rationale for matching NGOs to surplus food donations.
 */

export function calculateNgoRecommendations(donation, ngos = [], foodRequests = []) {
  if (!donation || !ngos.length) return [];

  const now = new Date();
  const expiryDate = new Date(donation.expiryAt);
  const hoursUntilExpiry = Math.max(0, (expiryDate - now) / (1000 * 60 * 60));

  const recommendations = ngos
    .filter((ngo) => ngo.approvalStatus === 'approved')
    .map((ngo) => {
      let categoryScore = 10;
      let urgencyScore = 5;
      let expiryScore = 10;
      let quantityScore = 5;
      let capacityScore = 5;

      const reasons = [];

      // 1. Category Compatibility & Active Requests
      const ngoRequests = foodRequests.filter(
        (r) => (r.ngoId === ngo._id || r.ngoId === ngo.id) && r.status === 'Active'
      );

      const matchingCategoryRequest = ngoRequests.find(
        (r) => r.category.toLowerCase() === donation.category.toLowerCase()
      );

      if (matchingCategoryRequest) {
        categoryScore = 25;
        reasons.push(`Active request for ${donation.category}`);

        // Urgency factor
        switch (matchingCategoryRequest.urgency) {
          case 'Critical':
            urgencyScore = 25;
            reasons.push('Critical urgency request');
            break;
          case 'High':
            urgencyScore = 20;
            reasons.push('High urgency demand');
            break;
          case 'Medium':
            urgencyScore = 15;
            reasons.push('Moderate requirement');
            break;
          default:
            urgencyScore = 10;
            break;
        }

        // Quantity match factor
        const reqQty = parseInt(matchingCategoryRequest.quantityRequired) || 0;
        const donQty = parseInt(donation.quantity) || 0;
        if (reqQty >= donQty) {
          quantityScore = 15;
          reasons.push(`Compatible quantity (${donQty} units requested)`);
        } else if (reqQty > 0) {
          quantityScore = 10;
          reasons.push(`Partial quantity match (${reqQty}/${donQty})`);
        }
      } else {
        const reqList = Array.isArray(ngo.requirements)
          ? ngo.requirements
          : typeof ngo.requirements === 'string'
          ? ngo.requirements.split(',').map((s) => s.trim())
          : [];

        if (
          reqList.some(
            (r) => r.toLowerCase().includes(donation.category.toLowerCase()) || donation.category.toLowerCase().includes(r.toLowerCase())
          )
        ) {
          categoryScore = 18;
          reasons.push(`Matches NGO preferred category (${donation.category})`);
        } else {
          reasons.push(`General food distribution capability`);
        }
      }

      // 2. Expiry Proximity Factor
      if (hoursUntilExpiry <= 6) {
        expiryScore = 25;
        reasons.push(`Donation expires soon (<${Math.ceil(hoursUntilExpiry)}h left)`);
      } else if (hoursUntilExpiry <= 12) {
        expiryScore = 20;
        reasons.push(`Expiry within 12 hours`);
      } else if (hoursUntilExpiry <= 24) {
        expiryScore = 15;
        reasons.push(`24-hour expiry window`);
      } else {
        expiryScore = 10;
      }

      // 3. Capacity Factor
      const dailyCap = parseInt(ngo.capacity) || 100;
      if (dailyCap >= 150) {
        capacityScore = 10;
        reasons.push('High daily processing capacity');
      } else if (dailyCap >= 50) {
        capacityScore = 8;
      } else {
        capacityScore = 5;
      }

      const totalScore = Math.min(
        100,
        Math.round(categoryScore + urgencyScore + expiryScore + quantityScore + capacityScore)
      );

      const reasonSummary = reasons.join(', ') + '.';

      return {
        ngoId: ngo._id || ngo.id,
        organizationName: ngo.organizationName,
        registrationNumber: ngo.registrationNumber,
        location: ngo.location,
        capacity: ngo.capacity,
        score: totalScore,
        reason: reasonSummary,
        factors: {
          categoryScore,
          urgencyScore,
          expiryScore,
          quantityScore,
          capacityScore,
        },
      };
    });

  // Sort descending by recommendation score
  return recommendations.sort((a, b) => b.score - a.score);
}
